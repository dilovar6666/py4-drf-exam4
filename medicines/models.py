from django.core.validators import MinValueValidator
from django.db import models

from pharmacies.models import Pharmacy


class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Medicine(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    active_ingredient = models.CharField(max_length=255, blank=True)
    dosage = models.CharField(max_length=100, blank=True)
    form = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="medicines/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PharmacyMedicine(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("pharmacy", "medicine"),
                name="unique_pharmacy_medicine",
            )
        ]

    def __str__(self):
        return f"{self.pharmacy} - {self.medicine}"


class PriceHistory(models.Model):
    pharmacy_medicine = models.ForeignKey(PharmacyMedicine, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.pharmacy_medicine} - {self.price}"
