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
        pharmacy_medicine = attrs.get(
            "pharmacy_medicine", getattr(self.instance, "pharmacy_medicine", None)
        )

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
            if not request or (not request.user.is_staff and request.user.role != "pharmacist"):
                raise serializers.ValidationError({"status": "Статус может менять только аптека."})
            current = self.instance.status
            target = attrs.get("status", current)
            transitions = {
                "pending": {"confirmed", "cancelled"},
                "confirmed": {"ready", "cancelled"},
                "ready": {"completed", "cancelled"},
                "completed": set(),
                "cancelled": set(),
            }
            if target != current and target not in transitions[current]:
                raise serializers.ValidationError(
                    {"status": f"Переход {current} → {target} недоступен."}
                )
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            stock = PharmacyMedicine.objects.select_for_update().get(
                pk=validated_data["pharmacy_medicine"].pk
            )
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
            if previous_status != "cancelled" and reservation.status == "cancelled":
                stock = PharmacyMedicine.objects.select_for_update().get(
                    pk=reservation.pharmacy_medicine_id
                )
                stock.quantity += reservation.quantity
                stock.save(update_fields=("quantity", "updated_at"))
            return reservation

