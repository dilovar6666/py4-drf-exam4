from django.contrib import admin

from .models import Notification, StockNotification


admin.site.register(Notification)
admin.site.register(StockNotification)
