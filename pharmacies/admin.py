from django.contrib import admin

from .models import Pharmacy, PharmacyWorker


admin.site.register(Pharmacy)
admin.site.register(PharmacyWorker)
