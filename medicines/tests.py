from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Medicine


class MedicineSearchTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Витамины")
        self.medicine = Medicine.objects.create(
            name="Парацетамол",
            category=category,
            active_ingredient="Paracetamol",
            manufacturer="Pharma Test",
            barcode="1234567890",
        )
        self.client = APIClient()

    def assert_found(self, query):
        response = self.client.get("/api/medicines/search/", {"q": query})
        self.assertEqual(response.status_code, 200)
        self.assertIn(self.medicine.id, [item["id"] for item in response.data])

    def test_searches_supported_fields(self):
        for query in ("парац", "paracetamol", "pharma", "витамин", "123456"):
            with self.subTest(query=query):
                self.assert_found(query)

