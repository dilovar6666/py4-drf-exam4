from django.db import transaction
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from medicines.models import PharmacyMedicine
from notifications.realtime import push_notification

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
        reservation = serializer.save(user=self.request.user, status=Reservation.Status.PENDING)
        pharmacy = reservation.pharmacy_medicine.pharmacy
        for worker in pharmacy.pharmacyworker_set.select_related("user"):
            push_notification(worker.user, "Новая бронь", f"Новая бронь #{reservation.pk} в аптеке {pharmacy.name}.")


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return reservations_for(self.request.user)

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        reservation = serializer.save()
        if reservation.status == previous_status:
            return
        labels = {
            Reservation.Status.CONFIRMED: ("Бронь подтверждена", "Аптека подтвердила вашу бронь."),
            Reservation.Status.READY: ("Бронь готова", "Ваш заказ готов к выдаче."),
            Reservation.Status.COMPLETED: ("Бронь завершена", "Выдача по брони завершена."),
            Reservation.Status.CANCELLED: ("Бронь отменена", "Бронь была отменена."),
        }
        if reservation.status in labels:
            title, message = labels[reservation.status]
            push_notification(reservation.user, title, f"{message} Бронь #{reservation.pk}.")
        if reservation.status == Reservation.Status.CANCELLED and self.request.user.id == reservation.user_id:
            pharmacy = reservation.pharmacy_medicine.pharmacy
            for worker in pharmacy.pharmacyworker_set.select_related("user"):
                push_notification(worker.user, "Клиент отменил бронь", f"Бронь #{reservation.pk} отменена клиентом.")

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
