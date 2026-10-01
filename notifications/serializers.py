from rest_framework import serializers

from .models import Notification, StockNotification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"

    def validate(self, attrs):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            allowed = {"is_read"}
            if any(field not in allowed for field in self.initial_data):
                raise serializers.ValidationError(
                    "Пользователь может изменить только статус прочтения."
                )
        return attrs


class StockNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockNotification
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}
