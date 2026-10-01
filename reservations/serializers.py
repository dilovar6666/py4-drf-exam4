from django.db import transaction
from rest_framework import serializers

from medicines.models import PharmacyMedicine

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ("user", "created_at", "expires_at")

    def validate(self, attrs):
        request = self.context.get("request")
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        pharmacy_medicine = attrs.get("pharmacy_medicine", getattr(self.instance, "pharmacy_medicine", None))
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Количество должно быть больше нуля."})
        if self.instance:
            if "quantity" in self.initial_data or "pharmacy_medicine" in self.initial_data:
                raise serializers.ValidationError("Состав существующей брони нельзя изменить.")
        elif pharmacy_medicine and quantity > pharmacy_medicine.quantity:
            raise serializers.ValidationError({"quantity": "Недостаточно товара в наличии."})

        if "status" in self.initial_data:
            if not self.instance:
                raise serializers.ValidationError({"status": "Новая бронь всегда имеет статус pending."})
            current = self.instance.status
            target = attrs.get("status", current)
            transitions = {
                Reservation.Status.PENDING: {Reservation.Status.CONFIRMED, Reservation.Status.CANCELLED},
                Reservation.Status.CONFIRMED: {Reservation.Status.READY, Reservation.Status.CANCELLED},
                Reservation.Status.READY: {Reservation.Status.COMPLETED, Reservation.Status.CANCELLED},
                Reservation.Status.COMPLETED: set(),
                Reservation.Status.CANCELLED: set(),
            }
            is_staff_flow = request and (request.user.is_staff or request.user.role == "pharmacist")
            is_owner_cancel = request and (
                self.instance.user_id == request.user.id
                and target == Reservation.Status.CANCELLED
                and current in {Reservation.Status.PENDING, Reservation.Status.CONFIRMED, Reservation.Status.READY}
            )
            if not is_staff_flow and not is_owner_cancel:
                raise serializers.ValidationError({"status": "Покупатель может только отменить активную бронь."})
            if target != current and target not in transitions[current]:
                raise serializers.ValidationError({"status": f"Переход {current} → {target} недоступен."})
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            stock = PharmacyMedicine.objects.select_for_update().get(pk=validated_data["pharmacy_medicine"].pk)
            quantity = validated_data["quantity"]
            if quantity > stock.quantity:
                raise serializers.ValidationError({"quantity": "Недостаточно товара в наличии."})
            stock.quantity -= quantity
            stock.save(update_fields=("quantity", "updated_at"))
            validated_data["pharmacy_medicine"] = stock
            return super().create(validated_data)

    def update(self, instance, validated_data):
        previous_status = instance.status
        with transaction.atomic():
            reservation = super().update(instance, validated_data)
            if previous_status != Reservation.Status.CANCELLED and reservation.status == Reservation.Status.CANCELLED:
                stock = PharmacyMedicine.objects.select_for_update().get(pk=reservation.pharmacy_medicine_id)
                stock.quantity += reservation.quantity
                stock.save(update_fields=("quantity", "updated_at"))
            return reservation
