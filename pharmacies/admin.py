from django.contrib import admin

from .models import Pharmacy, PharmacyApplication, PharmacyWorker


admin.site.register(Pharmacy)
admin.site.register(PharmacyWorker)
admin.site.register(PharmacyApplication)
