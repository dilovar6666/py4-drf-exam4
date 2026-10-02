from rest_framework import serializers

from django.db.models import Avg

from accounts.models import CustomUser
from pharmacies.models import PharmacyWorker

from .models import PharmacistReview, Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Рейтинг должен быть от 1 до 5.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        pharmacy = attrs.get("pharmacy", getattr(self.instance, "pharmacy", None))
        if request and pharmacy:
            reviews = Review.objects.filter(user=request.user, pharmacy=pharmacy)
            if self.instance:
                reviews = reviews.exclude(pk=self.instance.pk)
            if reviews.exists():
                raise serializers.ValidationError(
                    {"pharmacy": "Вы уже оставили отзыв об этой аптеке."}
                )
        return attrs


class PharmacistReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacistReview
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Рейтинг должен быть от 1 до 5.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        pharmacist = attrs.get("pharmacist", getattr(self.instance, "pharmacist", None))
        if pharmacist and pharmacist.role != CustomUser.Role.PHARMACIST:
            raise serializers.ValidationError({"pharmacist": "Пользователь не является фармацевтом."})
        if request and pharmacist and request.user.pk == pharmacist.pk:
            raise serializers.ValidationError({"pharmacist": "Нельзя оценивать самого себя."})
        if request and pharmacist:
            reviews = PharmacistReview.objects.filter(
                user=request.user, pharmacist=pharmacist
            )
            if self.instance:
                reviews = reviews.exclude(pk=self.instance.pk)
            if reviews.exists():
                raise serializers.ValidationError(
                    {"pharmacist": "Вы уже оставили отзыв этому фармацевту."}
                )
        return attrs


class PharmacistRatingSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    pharmacy = serializers.SerializerMethodField()
    pharmacy_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "id", "username", "avatar", "rating", "review_count",
            "pharmacy", "pharmacy_name",
        )

    def get_rating(self, obj):
        value = obj.pharmacist_reviews.aggregate(value=Avg("rating"))["value"]
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return obj.pharmacist_reviews.count()

    def get_worker(self, obj):
        if not hasattr(obj, "_rating_worker"):
            obj._rating_worker = PharmacyWorker.objects.filter(user=obj).select_related("pharmacy").first()
        return obj._rating_worker

    def get_pharmacy(self, obj):
        worker = self.get_worker(obj)
        return worker.pharmacy_id if worker else None

    def get_pharmacy_name(self, obj):
        worker = self.get_worker(obj)
        return worker.pharmacy.name if worker else None
