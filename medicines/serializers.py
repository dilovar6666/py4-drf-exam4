from rest_framework import serializers

from .models import Category, Medicine, PharmacyMedicine, PriceHistory
from notifications.realtime import notify_stock_available


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = "__all__"


class PharmacyMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyMedicine
        fields = "__all__"

    def validate_pharmacy(self, pharmacy):
        request = self.context.get("request")
        if request and request.user.is_authenticated and request.user.role == "pharmacist":
            if not pharmacy.pharmacyworker_set.filter(user=request.user).exists():
                raise serializers.ValidationError("Можно выбрать только свою аптеку.")
        return pharmacy

    def create(self, validated_data):
        stock = super().create(validated_data)
        if stock.quantity > 0:
            notify_stock_available(stock)
        return stock

    def update(self, instance, validated_data):
        was_empty = instance.quantity == 0
        stock = super().update(instance, validated_data)
        if was_empty and stock.quantity > 0:
            notify_stock_available(stock)
        return stock


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = "__all__"
