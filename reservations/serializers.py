from rest_framework import serializers

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ("user", "status", "created_at")

    def validate(self, attrs):
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        pharmacy_medicine = attrs.get(
            "pharmacy_medicine",
            getattr(self.instance, "pharmacy_medicine", None),
        )

        if quantity <= 0:
            raise serializers.ValidationError(
                {"quantity": "Quantity must be greater than zero."}
            )

        if pharmacy_medicine and quantity > pharmacy_medicine.quantity:
            raise serializers.ValidationError(
                {"quantity": "Requested quantity is not available."}
            )

        return attrs
