from django.urls import path

from .views import (
    PharmacistListView,
    PharmacistReviewDetailView,
    PharmacistReviewListCreateView,
    PharmacyReviewsView,
    ReviewDetailView,
    ReviewListCreateView,
)


urlpatterns = [
    path("reviews/", ReviewListCreateView.as_view()),
    path("reviews/<int:pk>/", ReviewDetailView.as_view()),
    path("pharmacies/<int:pharmacy_id>/reviews/", PharmacyReviewsView.as_view()),
    path("pharmacists/", PharmacistListView.as_view()),
    path("pharmacist-reviews/", PharmacistReviewListCreateView.as_view()),
    path("pharmacist-reviews/<int:pk>/", PharmacistReviewDetailView.as_view()),
]
