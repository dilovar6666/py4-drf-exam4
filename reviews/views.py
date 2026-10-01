from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import get_pharmacy_reviews
from accounts.models import CustomUser

from .models import PharmacistReview, Review
from .serializers import (
    PharmacistRatingSerializer,
    PharmacistReviewSerializer,
    ReviewSerializer,
)


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.method == "GET":
            return Review.objects.all()
        if self.request.user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(user=self.request.user)


class PharmacyReviewsView(APIView):
    def get(self, request, pharmacy_id):
        reviews = get_pharmacy_reviews(pharmacy_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class PharmacistListView(generics.ListAPIView):
    queryset = CustomUser.objects.filter(role=CustomUser.Role.PHARMACIST)
    serializer_class = PharmacistRatingSerializer


class PharmacistReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = PharmacistReviewSerializer

    def get_queryset(self):
        queryset = PharmacistReview.objects.all()
        pharmacist_id = self.request.query_params.get("pharmacist")
        if pharmacist_id:
            queryset = queryset.filter(pharmacist_id=pharmacist_id)
        return queryset

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PharmacistReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PharmacistReviewSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.method == "GET":
            return PharmacistReview.objects.all()
        if self.request.user.is_staff:
            return PharmacistReview.objects.all()
        return PharmacistReview.objects.filter(user=self.request.user)
