from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from unittest.mock import MagicMock, patch
from rest_framework.test import APIClient, APITestCase

from notifications.models import Notification, StockNotification
from pharmacies.models import Pharmacy

from .models import Category, Medicine, PharmacyMedicine


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
        self.assertIn("не настроен", response.data["detail"])

    @override_settings(GEMINI_API_KEY="")
    def test_personal_medical_advice_is_refused_without_external_call(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, {"question": "Какую дозу мне принимать?"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("врачу", response.data["answer"])

    @override_settings(GEMINI_API_KEY="configured-test-key")
    @patch("medicines.ai.request.urlopen")
    def test_configured_gemini_client_response_is_returned(self, urlopen):
        response = MagicMock()
        response.read.return_value = '{"candidates":[{"content":{"parts":[{"text":"Справочный ответ"}]}}]}'.encode("utf-8")
        response.__enter__.return_value = response
        urlopen.return_value = response
        self.client.force_authenticate(self.user)
        result = self.client.post(self.url, {"question": "Что это?"})
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.data["answer"], "Справочный ответ")


class StockAvailabilityNotificationTests(APITestCase):
    def test_zero_to_available_notifies_subscriber_once(self):
        User = get_user_model()
        subscriber = User.objects.create_user(username="stock-user", password="pass12345")
        admin = User.objects.create_superuser(username="stock-admin", password="pass12345")
        medicine = Medicine.objects.create(name="Back in stock")
        pharmacy = Pharmacy.objects.create(
            name="Stock Pharmacy", address="Dushanbe", latitude=38.57, longitude=68.78
        )
        stock = PharmacyMedicine.objects.create(
            pharmacy=pharmacy, medicine=medicine, price=12, quantity=0
        )
        subscription = StockNotification.objects.create(
            user=subscriber, medicine=medicine, pharmacy=pharmacy
        )
        self.client.force_authenticate(admin)
        response = self.client.patch(
            f"/api/pharmacy-medicines/{stock.id}/", {"quantity": 4}
        )
        self.assertEqual(response.status_code, 200)
        subscription.refresh_from_db()
        self.assertFalse(subscription.is_active)
        self.assertEqual(
            Notification.objects.filter(user=subscriber, title="Лекарство снова в наличии").count(),
            1,
        )
