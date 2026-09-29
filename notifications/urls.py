from django.urls import path

from .views import (
    NotificationDetailView,
    NotificationListCreateView,
    StockNotificationDetailView,
    StockNotificationListCreateView,
)


urlpatterns = [
    path("notifications/", NotificationListCreateView.as_view()),
    path("notifications/<int:pk>/", NotificationDetailView.as_view()),
    path("stock-notifications/", StockNotificationListCreateView.as_view()),
    path("stock-notifications/<int:pk>/", StockNotificationDetailView.as_view()),
]
