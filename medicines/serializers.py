from rest_framework import serializers

from .models import Category, Medicine, PharmacyMedicine, PriceHistory


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


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = "__all__"
