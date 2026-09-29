from django.contrib import admin

from .models import Category, Medicine, PharmacyMedicine, PriceHistory


admin.site.register(Category)
admin.site.register(Medicine)
admin.site.register(PharmacyMedicine)
admin.site.register(PriceHistory)
