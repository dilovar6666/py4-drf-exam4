from datetime import time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from chats.models import Chat, Message
from medicines.models import Category, Medicine, PharmacyMedicine, PriceHistory
from notifications.models import Notification, StockNotification
from pharmacies.models import Pharmacy, PharmacyWorker
from reservations.models import Reservation
from reviews.models import PharmacistReview, Review


class Command(BaseCommand):
    help = "Create repeatable connected demo data for PharmaMap."

    def handle(self, *args, **options):
        users = self.create_users()
        pharmacies = self.create_pharmacies()
        self.create_workers(users, pharmacies)
        categories = self.create_categories()
        medicines = self.create_medicines(categories)
        inventory = self.create_inventory(pharmacies, medicines)
        self.create_price_history(inventory)
        self.create_reviews(users, pharmacies)
        self.create_pharmacist_reviews(users)
        self.create_reservations(users, inventory)
        self.create_chats(users, pharmacies, medicines)
        self.create_notifications(users, pharmacies, medicines)
        self.print_counts()

    def upsert_user(self, username, password, **defaults):
        User = get_user_model()
        user, _ = User.objects.update_or_create(username=username, defaults=defaults)
        user.set_password(password)
        user.save(update_fields=["password"])
        return user

    def create_users(self):
        users = {}
        admin = self.upsert_user(
            "admin",
            "admin",
            email="admin@example.com",
            phone="+992501110001",
            role="user",
            is_staff=True,
            is_superuser=True,
        )
        users[admin.username] = admin

        for index, name in enumerate(("user1", "user2", "user3", "user4"), 1):
            users[name] = self.upsert_user(
                name,
                "demo12345",
                email=f"{name}@example.com",
                phone=f"+9925011200{index}",
                role="user",
                is_staff=False,
                is_superuser=False,
            )

        for index in range(1, 7):
            name = f"pharmacist{index}"
            users[name] = self.upsert_user(
                name,
                "demo12345",
                email=f"{name}@example.com",
                phone=f"+9925011300{index}",
                role="pharmacist",
                is_staff=False,
                is_superuser=False,
            )
        return users

    def create_pharmacies(self):
        legacy_names = (
            "PharmaMap Demo — Центр", "PharmaMap Demo — Сахиль", "PharmaMap Demo — 28 Мая",
            "PharmaMap Demo — Гянджлик", "PharmaMap Demo — Нариманов", "PharmaMap Demo — Эльмляр",
            "PharmaMap Demo — Иншаатчылар", "PharmaMap Demo — Хатаи",
            "PharmaMap Demo — Белый город", "PharmaMap Demo — Ахмедлы",
        )
        dushanbe_names = (
            "PharmaMap Demo — Рудаки", "PharmaMap Demo — Сомони", "PharmaMap Demo — Айни",
            "PharmaMap Demo — Шохмансур", "PharmaMap Demo — Сино", "PharmaMap Demo — Фирдавси",
            "PharmaMap Demo — Турсунзода", "PharmaMap Demo — Борбад",
            "PharmaMap Demo — Пушкина", "PharmaMap Demo — Зарафшон",
        )
        for old_name, new_name in zip(legacy_names, dushanbe_names):
            Pharmacy.objects.filter(name=old_name).update(name=new_name)

        rows = [
            ("PharmaMap Demo — Рудаки", "просп. Рудаки, 74", "38.573240", "68.786720", "+992124900101", time(8), time(23), False, "Демонстрационная городская аптека в центральной части Душанбе."),
            ("PharmaMap Demo — Сомони", "просп. Исмоили Сомони, 34", "38.575820", "68.775620", "+992124900102", None, None, True, "Круглосуточная демонстрационная аптека в центральной части города."),
            ("PharmaMap Demo — Айни", "ул. Садриддина Айни, 52", "38.563500", "68.814300", "+992124900103", time(8, 30), time(22), False, "Аптека с широким учебным ассортиментом лекарств и товаров ухода."),
            ("PharmaMap Demo — Шохмансур", "ул. Нисора Мухаммада, 14", "38.568900", "68.807800", "+992124900104", time(9), time(22), False, "Демонстрационная аптека в районе Шохмансур."),
            ("PharmaMap Demo — Сино", "ул. Маяковского, 89", "38.548856", "68.747521", "+992124900105", None, None, True, "Круглосуточный пункт PharmaMap с учебными данными о наличии."),
            ("PharmaMap Demo — Фирдавси", "ул. Негмата Карабаева, 60", "38.538900", "68.776400", "+992124900106", time(8), time(21, 30), False, "Светлая районная аптека с товарами первой помощи и ухода."),
            ("PharmaMap Demo — Турсунзода", "ул. Мирзо Турсунзода, 31", "38.572803", "68.795805", "+992124900107", time(8), time(22), False, "Демонстрационная аптека в жилом районе с удобным графиком."),
            ("PharmaMap Demo — Борбад", "ул. Борбад, 175", "38.525500", "68.760900", "+992124900108", None, None, True, "Круглосуточная демонстрационная точка в южной части Душанбе."),
            ("PharmaMap Demo — Пушкина", "ул. Пушкина, 10", "38.574900", "68.786100", "+992124900109", time(9), time(23), False, "Современная учебная аптека в восточной части центра Душанбе."),
            ("PharmaMap Demo — Зарафшон", "ул. Шамси, 18", "38.590800", "68.745700", "+992124900110", time(8), time(22), False, "Районная демонстрационная аптека с товарами повседневного спроса."),
        ]
        pharmacies = []
        for name, address, latitude, longitude, phone, opening, closing, all_day, description in rows:
            pharmacy, _ = Pharmacy.objects.update_or_create(
                name=name,
                defaults={
                    "address": address,
                    "latitude": latitude,
                    "longitude": longitude,
                    "phone": phone,
                    "opening_time": opening,
                    "closing_time": closing,
                    "is_24_hours": all_day,
                    "description": description,
                },
            )
            pharmacies.append(pharmacy)
        return pharmacies

    def create_workers(self, users, pharmacies):
        assignments = [
            ("pharmacist1", 0), ("pharmacist1", 1),
            ("pharmacist2", 2), ("pharmacist2", 3),
            ("pharmacist3", 4), ("pharmacist3", 5),
            ("pharmacist4", 6), ("pharmacist4", 7),
            ("pharmacist5", 8), ("pharmacist6", 9),
        ]
        for username, pharmacy_index in assignments:
            PharmacyWorker.objects.get_or_create(
                user=users[username], pharmacy=pharmacies[pharmacy_index]
            )

    def create_categories(self):
        names = (
            "Обезболивающие", "Простуда и грипп", "Аллергия", "Витамины",
            "ЖКТ", "Антисептики", "Детские препараты", "Уход", "Первая помощь",
        )
        return {name: Category.objects.get_or_create(name=name)[0] for name in names}

    def create_medicines(self, categories):
        rows = [
            ("Парацетамол", "Обезболивающие", "Парацетамол", "500 мг", "таблетки", "DemoPharm", "100000000001"),
            ("Ибупрофен", "Обезболивающие", "Ибупрофен", "400 мг", "таблетки", "HealthLab", "100000000002"),
            ("Напроксен", "Обезболивающие", "Напроксен", "250 мг", "таблетки", "Medica", "100000000003"),
            ("Ацетилсалициловая кислота", "Обезболивающие", "Ацетилсалициловая кислота", "500 мг", "таблетки", "BioLine", "100000000004"),
            ("Парацетамол детский", "Детские препараты", "Парацетамол", "120 мг/5 мл", "суспензия", "KidsCare", "100000000005"),
            ("Ибупрофен детский", "Детские препараты", "Ибупрофен", "100 мг/5 мл", "суспензия", "KidsCare", "100000000006"),
            ("Физраствор детский", "Детские препараты", "Натрия хлорид", "0,9%", "капли", "CareDrop", "100000000007"),
            ("Порошок от простуды", "Простуда и грипп", "Парацетамол + аскорбиновая кислота", "500 мг", "порошок", "ColdCare", "100000000008"),
            ("Спрей для носа", "Простуда и грипп", "Ксилометазолин", "0,1%", "спрей", "Nasalab", "100000000009"),
            ("Пастилки для горла", "Простуда и грипп", "Амилметакрезол", "0,6 мг", "пастилки", "ThroatLab", "100000000010"),
            ("Солевой спрей", "Простуда и грипп", "Морская вода", "изотонический", "спрей", "AquaCare", "100000000011"),
            ("Лоратадин", "Аллергия", "Лоратадин", "10 мг", "таблетки", "AllergyLab", "100000000012"),
            ("Цетиризин", "Аллергия", "Цетиризин", "10 мг", "таблетки", "AllergyLab", "100000000013"),
            ("Спрей от аллергии", "Аллергия", "Мометазон", "50 мкг", "спрей", "Nasalab", "100000000014"),
            ("Витамин C", "Витамины", "Аскорбиновая кислота", "500 мг", "шипучие таблетки", "VitaPlus", "100000000015"),
            ("Витамин D3", "Витамины", "Колекальциферол", "1000 МЕ", "капсулы", "VitaPlus", "100000000016"),
            ("Магний B6", "Витамины", "Магний + пиридоксин", "48 мг", "таблетки", "MineralLab", "100000000017"),
            ("Мультивитаминный комплекс", "Витамины", "Комплекс витаминов", "30 компонентов", "таблетки", "VitaPlus", "100000000018"),
            ("Омепразол", "ЖКТ", "Омепразол", "20 мг", "капсулы", "GastroLab", "100000000019"),
            ("Пантопразол", "ЖКТ", "Пантопразол", "40 мг", "таблетки", "GastroLab", "100000000020"),
            ("Сорбент", "ЖКТ", "Диоксид кремния", "3 г", "порошок", "BioLine", "100000000021"),
            ("Раствор для регидратации", "ЖКТ", "Соли для регидратации", "18,9 г", "порошок", "HydraCare", "100000000022"),
            ("Хлоргексидин", "Антисептики", "Хлоргексидин", "0,05%", "раствор", "CleanMed", "100000000023"),
            ("Перекись водорода", "Антисептики", "Перекись водорода", "3%", "раствор", "CleanMed", "100000000024"),
            ("Антисептический спрей", "Антисептики", "Октенидин", "50 мл", "спрей", "CareSafe", "100000000025"),
            ("Крем увлажняющий", "Уход", "Глицерин + пантенол", "75 мл", "крем", "DermaCare", "100000000026"),
            ("Пантенол", "Уход", "Декспантенол", "5%", "крем", "DermaCare", "100000000027"),
            ("Бальзам для губ", "Уход", "Пантенол + масла", "4,5 г", "бальзам", "DermaCare", "100000000028"),
            ("Солнцезащитный крем SPF 50", "Уход", "Комбинированные UV-фильтры", "50 мл", "крем", "SunLab", "100000000029"),
            ("Пластырь бактерицидный", "Первая помощь", "Текстильная основа", "20 шт.", "пластырь", "CareSafe", "100000000030"),
            ("Бинт стерильный", "Первая помощь", "Хлопок", "5 м × 10 см", "бинт", "CareSafe", "100000000031"),
            ("Салфетки стерильные", "Первая помощь", "Марля", "10 шт.", "салфетки", "CareSafe", "100000000032"),
            ("Термометр электронный", "Первая помощь", "Цифровой датчик", "универсальный", "прибор", "MediTech", "100000000033"),
            ("Маска медицинская", "Первая помощь", "Нетканый материал", "10 шт.", "маски", "CareSafe", "100000000034"),
            ("Гель для рук", "Антисептики", "Этанол", "70%", "гель", "CleanMed", "100000000035"),
            ("Капли увлажняющие", "Уход", "Гиалуронат натрия", "10 мл", "капли", "VisionCare", "100000000036"),
            ("Пробиотический комплекс", "ЖКТ", "Лактобактерии", "10 млрд КОЕ", "капсулы", "BioBalance", "100000000037"),
            ("Цинк", "Витамины", "Цинка цитрат", "15 мг", "таблетки", "MineralLab", "100000000038"),
            ("Кальций D3", "Витамины", "Кальций + колекальциферол", "500 мг", "таблетки", "MineralLab", "100000000039"),
            ("Гель охлаждающий", "Первая помощь", "Ментол", "50 мл", "гель", "CareActive", "100000000040"),
        ]
        medicines = []
        for name, category, ingredient, dosage, form, manufacturer, barcode in rows:
            medicine, _ = Medicine.objects.update_or_create(
                barcode=barcode,
                defaults={
                    "name": name,
                    "category": categories[category],
                    "active_ingredient": ingredient,
                    "dosage": dosage,
                    "form": form,
                    "manufacturer": manufacturer,
                    "description": f"Демонстрационная справочная карточка препарата «{name}». Содержит сведения о форме выпуска и составе без медицинских рекомендаций.",
                },
            )
            medicines.append(medicine)
        return medicines

    def create_inventory(self, pharmacies, medicines):
        quantities = (0, 2, 4, 12, 18, 32, 45)
        inventory = []
        for medicine_index, medicine in enumerate(medicines):
            pharmacy_count = 4 + medicine_index % 4
            for offset in range(pharmacy_count):
                pharmacy = pharmacies[(medicine_index * 3 + offset * 2) % len(pharmacies)]
                price = Decimal("2.40") + Decimal(medicine_index % 11) * Decimal("1.37") + Decimal(offset) * Decimal("0.65")
                quantity = quantities[(medicine_index + offset * 2) % len(quantities)]
                stock, _ = PharmacyMedicine.objects.update_or_create(
                    pharmacy=pharmacy,
                    medicine=medicine,
                    defaults={"price": price.quantize(Decimal("0.01")), "quantity": quantity},
                )
                inventory.append(stock)
        return inventory

    def create_price_history(self, inventory):
        now = timezone.now()
        for index, stock in enumerate(inventory[:24]):
            for days, delta in ((10, Decimal("1.20")), (7, Decimal("0.70")), (3, Decimal("0.30")), (0, Decimal("0.00"))):
                price = (stock.price + delta).quantize(Decimal("0.01"))
                entry, _ = PriceHistory.objects.get_or_create(pharmacy_medicine=stock, price=price)
                PriceHistory.objects.filter(pk=entry.pk).update(created_at=now - timedelta(days=days))

    def create_reviews(self, users, pharmacies):
        texts = (
            (5, "Вежливый сотрудник и быстрый поиск нужной упаковки."),
            (4, "Удобное расположение, заказ подготовили вовремя."),
            (3, "Всё нормально, но вечером была небольшая очередь."),
            (2, "Нужной позиции оказалось меньше, чем ожидалось."),
            (5, "Чисто, спокойно и понятная консультация по наличию."),
            (4, "Хороший выбор и аккуратное обслуживание."),
            (1, "Долго ожидал подтверждения брони."),
            (5, "Круглосуточный график очень удобен."),
        )
        review_users = [users[f"user{index}"] for index in range(1, 5)]
        for index in range(18):
            user = review_users[index % len(review_users)]
            pharmacy = pharmacies[index % len(pharmacies)]
            rating, text = texts[index % len(texts)]
            Review.objects.update_or_create(
                user=user, pharmacy=pharmacy,
                defaults={"rating": rating, "text": text},
            )

    def create_reservations(self, users, inventory):
        statuses = ("pending", "confirmed", "ready", "completed", "cancelled")
        available = [stock for stock in inventory if stock.quantity >= 4][:10]
        now = timezone.now()
        for index, stock in enumerate(available):
            user = users[f"user{index % 4 + 1}"]
            reservation, _ = Reservation.objects.update_or_create(
                user=user, pharmacy_medicine=stock,
                defaults={
                    "quantity": index % 3 + 1,
                    "status": statuses[index % len(statuses)],
                    "expires_at": now + timedelta(hours=4 + index),
                },
            )
            Reservation.objects.filter(pk=reservation.pk).update(created_at=now - timedelta(days=index % 6))

    def create_pharmacist_reviews(self, users):
        rows = (
            ("user1", "pharmacist1", 5, "Вежливо объяснил наличие и быстро подготовил бронь."),
            ("user2", "pharmacist1", 4, "Ответил на вопросы по ассортименту."),
            ("user3", "pharmacist2", 5, "Очень внимательное обслуживание."),
            ("user4", "pharmacist2", 3, "Пришлось немного подождать ответа."),
            ("user1", "pharmacist3", 4, "Быстро подтвердил остаток в аптеке."),
            ("user2", "pharmacist4", 5, "Помог найти нужную упаковку."),
            ("user3", "pharmacist5", 4, "Хорошее и спокойное обслуживание."),
            ("user4", "pharmacist6", 5, "Бронь была готова вовремя."),
        )
        for username, pharmacist_name, rating, text in rows:
            PharmacistReview.objects.update_or_create(
                user=users[username],
                pharmacist=users[pharmacist_name],
                defaults={"rating": rating, "text": text},
            )

    def create_chats(self, users, pharmacies, medicines):
        dialogues = (
            ("Здравствуйте, есть ли этот препарат?", "Да, сейчас есть 4 упаковки.", "Можно отложить одну?"),
            ("Добрый день, бронь уже готова?", "Да, можно забрать до 20:00.", "Спасибо, подойду вечером."),
            ("Подскажите, товар снова появился?", "Да, остаток обновился сегодня.", "Отлично, оформлю бронь."),
        )
        for index in range(3):
            user = users[f"user{index + 1}"]
            pharmacy = pharmacies[index * 2]
            chat, _ = Chat.objects.get_or_create(user=user, pharmacy=pharmacy)
            pharmacist = users[f"pharmacist{index + 1}"]
            senders = (user, pharmacist, user)
            for message_index, text in enumerate(dialogues[index]):
                Message.objects.update_or_create(
                    chat=chat, text=text,
                    defaults={
                        "sender": senders[message_index],
                        "medicine": medicines[index],
                        "is_read": message_index < 2,
                    },
                )

    def create_notifications(self, users, pharmacies, medicines):
        rows = (
            ("Бронь подтверждена", "Аптека подтвердила вашу бронь."),
            ("Лекарство снова в наличии", "Позиция из уведомлений снова доступна."),
            ("Аптека ответила в чате", "В диалоге появилось новое сообщение."),
            ("Бронь готова", "Заказ можно забрать в выбранной аптеке."),
        )
        for user_index in range(1, 5):
            user = users[f"user{user_index}"]
            for row_index, (title, message) in enumerate(rows):
                Notification.objects.update_or_create(
                    user=user, title=title,
                    defaults={"message": message, "is_read": row_index < user_index - 1},
                )
            StockNotification.objects.update_or_create(
                user=user,
                medicine=medicines[user_index + 10],
                pharmacy=pharmacies[user_index],
                defaults={"is_active": True},
            )

    def print_counts(self):
        User = get_user_model()
        counts = {
            "users": User.objects.count(),
            "superusers": User.objects.filter(is_superuser=True).count(),
            "pharmacists": User.objects.filter(role="pharmacist").count(),
            "pharmacies": Pharmacy.objects.count(),
            "workers": PharmacyWorker.objects.count(),
            "categories": Category.objects.count(),
            "medicines": Medicine.objects.count(),
            "inventory": PharmacyMedicine.objects.count(),
            "price history": PriceHistory.objects.count(),
            "reviews": Review.objects.count(),
            "pharmacist reviews": PharmacistReview.objects.count(),
            "reservations": Reservation.objects.count(),
            "chats": Chat.objects.count(),
            "messages": Message.objects.count(),
            "notifications": Notification.objects.count(),
            "stock notifications": StockNotification.objects.count(),
        }
        self.stdout.write(self.style.SUCCESS("Demo data is ready:"))
        for label, count in counts.items():
            self.stdout.write(f"  {label}: {count}")
