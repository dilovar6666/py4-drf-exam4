from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser
from .serializers import CustomUserSerializer, RegisterSerializer


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
