import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, EmailVerificationCode
from .serializers import CustomUserSerializer, RegisterSerializer, VerifiedTokenObtainPairSerializer
from .tasks import send_verification_email


def create_verification_code(user):
    EmailVerificationCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = f"{secrets.randbelow(1_000_000):06d}"
    record = EmailVerificationCode.objects.create(
        user=user,
        code=code,
        expires_at=timezone.now() + timedelta(minutes=10),
    )
    return record


class VerifiedTokenObtainPairView(TokenObtainPairView):
    serializer_class = VerifiedTokenObtainPairSerializer


class CustomUserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser]


class CustomUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser]


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if CustomUser.objects.filter(email__iexact=serializer.validated_data["email"]).exists():
            return Response({"email": "Этот email уже используется."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            user = serializer.save()
            record = create_verification_code(user)
            try:
                send_verification_email.delay(user.id, record.code)
            except Exception:
                transaction.set_rollback(True)
                return Response(
                    {"detail": "Сервис email временно недоступен. Попробуйте позже."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        return Response({"detail": "Аккаунт создан. Проверьте email для подтверждения."}, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("email") or request.data.get("username")
        code = str(request.data.get("code", "")).strip()
        record = EmailVerificationCode.objects.filter(
            is_used=False,
            code=code,
            expires_at__gt=timezone.now(),
            user__email__iexact=identifier,
        ).select_related("user").first()
        if not record:
            return Response({"code": "Неверный или просроченный код."}, status=status.HTTP_400_BAD_REQUEST)
        record.is_used = True
        record.save(update_fields=("is_used",))
        record.user.is_email_verified = True
        record.user.save(update_fields=("is_email_verified",))
        return Response({"detail": "Email подтверждён."})


class ResendEmailCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        user = CustomUser.objects.filter(email__iexact=email).first()
        if not user or user.is_email_verified:
            return Response({"detail": "Если аккаунт требует подтверждения, письмо будет отправлено."})
        recent = EmailVerificationCode.objects.filter(
            user=user, is_used=False, created_at__gte=timezone.now() - timedelta(seconds=60)
        ).exists()
        if recent:
            return Response({"detail": "Повторная отправка доступна через минуту."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        record = create_verification_code(user)
        try:
            send_verification_email.delay(user.id, record.code)
        except Exception:
            return Response({"detail": "Сервис email временно недоступен."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"detail": "Код отправлен повторно."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        if "avatar" not in request.data:
            return Response(
                {"avatar": "Передайте изображение avatar или null для удаления."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        avatar = request.data.get("avatar")
        if avatar is None or avatar == "":
            if request.user.avatar:
                request.user.avatar.delete(save=False)
            request.user.avatar = None
            request.user.save(update_fields=("avatar",))
        else:
            serializer = CustomUserSerializer(request.user, data={"avatar": avatar}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(CustomUserSerializer(request.user).data)
