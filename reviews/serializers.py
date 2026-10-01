from rest_framework import serializers

from .models import Review


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
