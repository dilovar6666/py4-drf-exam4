from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import get_pharmacy_reviews
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class PharmacyReviewsView(APIView):
    def get(self, request, pharmacy_id):
        reviews = get_pharmacy_reviews(pharmacy_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
