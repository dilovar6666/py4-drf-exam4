from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser, SAFE_METHODS

from .models import Pharmacy, PharmacyWorker
from .serializers import PharmacySerializer, PharmacyWorkerSerializer


class PharmacyListCreateView(generics.ListCreateAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyWorkerListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]


class PharmacyWorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]
