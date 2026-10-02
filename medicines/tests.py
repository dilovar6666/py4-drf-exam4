from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
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


class MedicineAiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="ai-user", password="test-pass")
        self.medicine = Medicine.objects.create(name="Test medicine", active_ingredient="Example")
        self.client = APIClient()
        self.url = f"/api/ai/medicines/{self.medicine.id}/ask/"

    def test_ai_requires_authentication(self):
        response = self.client.post(self.url, {"question": "Что это?"})
        self.assertEqual(response.status_code, 401)

    @override_settings(GEMINI_API_KEY="")
    def test_missing_key_fails_cleanly(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, {"question": "Расскажи состав"})
        self.assertEqual(response.status_code, 503)
        self.assertIn("GEMINI_API_KEY", response.data["detail"])

    @override_settings(GEMINI_API_KEY="")
    def test_personal_medical_advice_is_refused_without_external_call(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, {"question": "Какую дозу мне принимать?"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("врачу", response.data["answer"])
