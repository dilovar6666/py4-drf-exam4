from rest_framework import serializers
from django.db.models import Avg

from .models import Pharmacy, PharmacyApplication, PharmacyWorker


class PharmacySerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    available_medicines = serializers.SerializerMethodField()
    completed_reservations = serializers.SerializerMethodField()

    def get_rating(self, obj):
        value = obj.review_set.aggregate(value=Avg("rating"))["value"]
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return obj.review_set.count()

    def get_available_medicines(self, obj):
        return obj.pharmacymedicine_set.filter(quantity__gt=0).count()

    def get_completed_reservations(self, obj):
        from reservations.models import Reservation
        return Reservation.objects.filter(
            pharmacy_medicine__pharmacy=obj,
            status=Reservation.Status.COMPLETED,
        ).count()

    class Meta:
        model = Pharmacy
        fields = "__all__"


class PharmacyWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyWorker
        fields = "__all__"


class PharmacyApplicationSerializer(serializers.ModelSerializer):
    applicant_username = serializers.CharField(source="applicant.username", read_only=True)

    class Meta:
        model = PharmacyApplication
        fields = "__all__"
        read_only_fields = ("applicant", "status", "pharmacy", "created_at")
