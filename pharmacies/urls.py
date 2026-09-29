from django.urls import path

from .views import (
    PharmacyDetailView,
    PharmacyListCreateView,
    PharmacyWorkerDetailView,
    PharmacyWorkerListCreateView,
)


urlpatterns = [
    path("pharmacies/", PharmacyListCreateView.as_view()),
    path("pharmacies/<int:pk>/", PharmacyDetailView.as_view()),
    path("pharmacy-workers/", PharmacyWorkerListCreateView.as_view()),
    path("pharmacy-workers/<int:pk>/", PharmacyWorkerDetailView.as_view()),
]
