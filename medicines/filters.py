from .models import Medicine, PharmacyMedicine


def filter_medicines(request):
    query = (request.GET.get("q") or request.GET.get("name") or "").strip()
    if not query:
        return Medicine.objects.all()

    needle = query.casefold()
    results = []
    for medicine in Medicine.objects.select_related("category"):
        values = (
            medicine.name,
            medicine.active_ingredient,
            medicine.manufacturer,
            medicine.category.name if medicine.category else "",
            medicine.barcode or "",
        )
        if any(needle in value.casefold() for value in values):
            results.append(medicine)
    return results


def get_available_medicine_pharmacies(medicine_id):
    return PharmacyMedicine.objects.filter(
        medicine_id=medicine_id,
        quantity__gt=0,
    ).order_by("price")
