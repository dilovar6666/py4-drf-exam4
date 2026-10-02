from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.realtime import push_notification

from .models import Pharmacy, PharmacyApplication, PharmacyWorker
from .serializers import PharmacyApplicationSerializer, PharmacySerializer, PharmacyWorkerSerializer


class PharmacyListCreateView(generics.ListCreateAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyWorkerListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PharmacyWorker.objects.all()
        if self.request.user.role == "pharmacist":
            return PharmacyWorker.objects.filter(user=self.request.user)
        return PharmacyWorker.objects.none()


class PharmacyWorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class PharmacyApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = PharmacyApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PharmacyApplication.objects.select_related("applicant", "pharmacy")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        application = serializer.save(applicant=self.request.user)
        for admin in get_user_model().objects.filter(is_staff=True):
            push_notification(
                admin,
                "Новая заявка на добавление аптеки",
                f"{application.applicant.username}: {application.name}, {application.address}.",
            )


class PharmacyApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = PharmacyApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PharmacyApplication.objects.all()
        return PharmacyApplication.objects.filter(applicant=self.request.user)


class PharmacyApplicationApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        with transaction.atomic():
            application = get_object_or_404(
                PharmacyApplication.objects.select_for_update(), pk=pk
            )
            if application.status == PharmacyApplication.Status.APPROVED:
                return Response(PharmacyApplicationSerializer(application).data)
            if application.status != PharmacyApplication.Status.PENDING:
                return Response(
                    {"detail": "Отклонённую заявку нельзя одобрить."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            pharmacy = Pharmacy.objects.create(
                name=application.name,
                address=application.address,
                latitude=application.latitude,
                longitude=application.longitude,
                phone=application.phone,
                opening_time=application.opening_time,
                closing_time=application.closing_time,
                is_24_hours=application.is_24_hours,
                description=application.description,
            )
            PharmacyWorker.objects.get_or_create(user=application.applicant, pharmacy=pharmacy)
            if application.applicant.role != "pharmacist":
                application.applicant.role = "pharmacist"
                application.applicant.save(update_fields=("role",))
            application.status = PharmacyApplication.Status.APPROVED
            application.pharmacy = pharmacy
            application.save(update_fields=("status", "pharmacy"))
        push_notification(
            application.applicant,
            "Заявка на аптеку одобрена",
            f"Аптека {pharmacy.name} добавлена в PharmaMap.",
        )
        return Response(PharmacyApplicationSerializer(application).data)


class PharmacyApplicationRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        application = get_object_or_404(PharmacyApplication, pk=pk)
        if application.status == PharmacyApplication.Status.APPROVED:
            return Response(
                {"detail": "Одобренную заявку нельзя отклонить."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        application.status = PharmacyApplication.Status.REJECTED
        application.save(update_fields=("status",))
        push_notification(
            application.applicant,
            "Заявка на аптеку отклонена",
            f"Заявка {application.name} не прошла проверку.",
        )
        return Response(PharmacyApplicationSerializer(application).data)
