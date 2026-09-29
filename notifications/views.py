from rest_framework import generics

from .models import Notification, StockNotification
from .serializers import NotificationSerializer, StockNotificationSerializer


class NotificationListCreateView(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class StockNotificationListCreateView(generics.ListCreateAPIView):
    queryset = StockNotification.objects.all()
    serializer_class = StockNotificationSerializer


class StockNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockNotification.objects.all()
    serializer_class = StockNotificationSerializer
