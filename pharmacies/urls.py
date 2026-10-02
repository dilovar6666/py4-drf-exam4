from django.urls import path

from .views import (
    PharmacyApplicationApproveView,
    PharmacyApplicationDetailView,
    PharmacyApplicationListCreateView,
    PharmacyApplicationRejectView,
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
    path("pharmacy-applications/", PharmacyApplicationListCreateView.as_view()),
    path("pharmacy-applications/<int:pk>/", PharmacyApplicationDetailView.as_view()),
    path("pharmacy-applications/<int:pk>/approve/", PharmacyApplicationApproveView.as_view()),
    path("pharmacy-applications/<int:pk>/reject/", PharmacyApplicationRejectView.as_view()),
]
