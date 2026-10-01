from django.db import transaction
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from medicines.models import PharmacyMedicine

from .models import Reservation
from .serializers import ReservationSerializer


def reservations_for(user):
    if user.is_staff:
        return Reservation.objects.all()
    if user.role == "pharmacist":
        return Reservation.objects.filter(
            pharmacy_medicine__pharmacy__pharmacyworker__user=user
        ).distinct()
    return Reservation.objects.filter(user=user)


class ReservationListCreateView(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return reservations_for(self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role == "pharmacist" and not self.request.user.is_staff:
            raise PermissionDenied("Фармацевт не создаёт клиентские брони.")
        serializer.save(user=self.request.user, status=Reservation.Status.PENDING)


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return reservations_for(self.request.user)

    def perform_destroy(self, instance):
        if not self.request.user.is_staff:
            raise PermissionDenied("Удалять брони может только администратор.")
        with transaction.atomic():
            if instance.status not in (Reservation.Status.CANCELLED, Reservation.Status.COMPLETED):
                stock = PharmacyMedicine.objects.select_for_update().get(
                    pk=instance.pharmacy_medicine_id
                )
                stock.quantity += instance.quantity
                stock.save(update_fields=("quantity", "updated_at"))
            instance.delete()

