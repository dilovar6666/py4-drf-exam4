from django.contrib import admin

from .models import PharmacistReview, Review


admin.site.register(Review)
admin.site.register(PharmacistReview)
