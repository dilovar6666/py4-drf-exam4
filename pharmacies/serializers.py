from rest_framework import serializers
from django.db.models import Avg

from .models import Pharmacy, PharmacyWorker


class PharmacySerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    def get_rating(self, obj):
        value = obj.review_set.aggregate(value=Avg("rating"))["value"]
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return obj.review_set.count()

    class Meta:
        model = Pharmacy
        fields = "__all__"


class PharmacyWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyWorker
        fields = "__all__"
