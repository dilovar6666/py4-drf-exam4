from rest_framework import generics

from .models import Pharmacy, PharmacyWorker
from .serializers import PharmacySerializer, PharmacyWorkerSerializer


class PharmacyListCreateView(generics.ListCreateAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer


class PharmacyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer


class PharmacyWorkerListCreateView(generics.ListCreateAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer


class PharmacyWorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PharmacyWorker.objects.all()
    serializer_class = PharmacyWorkerSerializer
