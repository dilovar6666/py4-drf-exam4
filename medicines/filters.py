from .models import Medicine, PharmacyMedicine


def filter_medicines(request):
    medicines = Medicine.objects.all()

    name = request.GET.get("name")
    if name:
        medicines = medicines.filter(name__icontains=name)

    return medicines


def get_available_medicine_pharmacies(medicine_id):
    return PharmacyMedicine.objects.filter(
        medicine_id=medicine_id,
        quantity__gt=0,
    ).order_by("price")
