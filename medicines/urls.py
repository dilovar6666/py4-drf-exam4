from django.urls import path

from .views import (
    CategoryDetailView,
    CategoryListCreateView,
    MedicineBarcodeView,
    MedicineDetailView,
    MedicineListCreateView,
    MedicinePharmaciesView,
    MedicineSearchView,
    PharmacyMedicineDetailView,
    PharmacyMedicineListCreateView,
    PriceHistoryDetailView,
    PriceHistoryListCreateView,
)


urlpatterns = [
    path("categories/", CategoryListCreateView.as_view()),
    path("categories/<int:pk>/", CategoryDetailView.as_view()),
    path("medicines/", MedicineListCreateView.as_view()),
    path("medicines/search/", MedicineSearchView.as_view()),
    path("medicines/barcode/<str:barcode>/", MedicineBarcodeView.as_view()),
    path("medicines/<int:medicine_id>/pharmacies/", MedicinePharmaciesView.as_view()),
    path("medicines/<int:pk>/", MedicineDetailView.as_view()),
    path("pharmacy-medicines/", PharmacyMedicineListCreateView.as_view()),
    path("pharmacy-medicines/<int:pk>/", PharmacyMedicineDetailView.as_view()),
    path("price-history/", PriceHistoryListCreateView.as_view()),
    path("price-history/<int:pk>/", PriceHistoryDetailView.as_view()),
]
