from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser, IsAuthenticated, SAFE_METHODS
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import filter_medicines, get_available_medicine_pharmacies
from .models import Category, Medicine, PharmacyMedicine, PriceHistory
from .serializers import *
from .ai import GeminiUnavailableError, generate_medicine_answer


class IsAdminOrPharmacist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.role == "pharmacist"
        )


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class MedicineListCreateView(generics.ListCreateAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyMedicineListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyMedicine.objects.all()
    serializer_class = PharmacyMedicineSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminOrPharmacist()]

    def perform_create(self, serializer):
        pharmacy = serializer.validated_data["pharmacy"]
        user = self.request.user
        if not user.is_staff and not pharmacy.pharmacyworker_set.filter(user=user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Можно менять остатки только своей аптеки.")
        serializer.save()


class PharmacyMedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyMedicine.objects.all()
    serializer_class = PharmacyMedicineSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminOrPharmacist()]

    def get_queryset(self):
        queryset = PharmacyMedicine.objects.all()
        if self.request.method not in SAFE_METHODS and not self.request.user.is_staff:
            queryset = queryset.filter(pharmacy__pharmacyworker__user=self.request.user)
        return queryset


class PriceHistoryListCreateView(generics.ListCreateAPIView):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PriceHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


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


class MedicineAiView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, medicine_id):
        medicine = get_object_or_404(Medicine, pk=medicine_id)
        question = str(request.data.get("question", "")).strip()
        if not question:
            return Response({"question": "Введите вопрос."}, status=status.HTTP_400_BAD_REQUEST)
        if len(question) > 1000:
            return Response({"question": "Вопрос слишком длинный."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            answer = generate_medicine_answer(medicine, question)
        except GeminiUnavailableError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"answer": answer, "medicine": medicine.id})
