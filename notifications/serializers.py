from rest_framework import serializers

from .models import Notification, StockNotification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class StockNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockNotification
        fields = "__all__"
