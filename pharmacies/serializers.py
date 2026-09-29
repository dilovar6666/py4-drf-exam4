from rest_framework import serializers

from .models import Pharmacy, PharmacyWorker


class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = "__all__"


class PharmacyWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyWorker
        fields = "__all__"
