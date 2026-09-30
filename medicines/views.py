from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import filter_medicines, get_available_medicine_pharmacies
from .models import Category, Medicine, PharmacyMedicine, PriceHistory
from .serializers import *


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MedicineListCreateView(generics.ListCreateAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer


class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer


class PharmacyMedicineListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyMedicine.objects.all()
    serializer_class = PharmacyMedicineSerializer


class PharmacyMedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyMedicine.objects.all()
    serializer_class = PharmacyMedicineSerializer


class PriceHistoryListCreateView(generics.ListCreateAPIView):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer


class PriceHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer


class MedicineSearchView(APIView):
    def get(self, request):
        medicines = filter_medicines(request)
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)


class MedicineBarcodeView(APIView):
    def get(self, request, barcode):
        medicine = get_object_or_404(Medicine, barcode=barcode)
        serializer = MedicineSerializer(medicine)
        return Response(serializer.data)


class MedicinePharmaciesView(APIView):
    def get(self, request, medicine_id):
        pharmacy_medicines = get_available_medicine_pharmacies(medicine_id)
        serializer = PharmacyMedicineSerializer(pharmacy_medicines, many=True)
        return Response(serializer.data)
