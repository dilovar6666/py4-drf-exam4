from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Notification, StockNotification
from .serializers import NotificationSerializer, StockNotificationSerializer


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class StockNotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = StockNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StockNotification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StockNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StockNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StockNotification.objects.filter(user=self.request.user)
