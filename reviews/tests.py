from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from pharmacies.models import Pharmacy

from .models import Review


class ReviewPermissionTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username="review-user", password="pass12345")
        self.other = User.objects.create_user(username="review-other", password="pass12345")
        self.pharmacy = Pharmacy.objects.create(
            name="Review Pharmacy", address="Dushanbe", latitude=38.57, longitude=68.78
        )
        self.review = Review.objects.create(
            user=self.other, pharmacy=self.pharmacy, rating=4, text="Хорошо"
        )

    def test_user_cannot_edit_another_review(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(f"/api/reviews/{self.review.id}/", {"rating": 1})
        self.assertEqual(response.status_code, 404)

    def test_user_cannot_create_second_review_for_pharmacy(self):
        Review.objects.create(user=self.user, pharmacy=self.pharmacy, rating=5)
        self.client.force_authenticate(self.user)
        response = self.client.post(
            "/api/reviews/", {"pharmacy": self.pharmacy.id, "rating": 3, "text": "Ещё"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Review.objects.filter(user=self.user, pharmacy=self.pharmacy).count(), 1)

