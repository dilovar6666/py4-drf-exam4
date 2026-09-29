from django.urls import path

from .views import PharmacyReviewsView, ReviewDetailView, ReviewListCreateView


urlpatterns = [
    path("reviews/", ReviewListCreateView.as_view()),
    path("reviews/<int:pk>/", ReviewDetailView.as_view()),
    path("pharmacies/<int:pharmacy_id>/reviews/", PharmacyReviewsView.as_view()),
]
