import json
from urllib import error, parse, request

from django.conf import settings


SYSTEM_INSTRUCTION = """Ты справочный помощник PharmaMap. Отвечай по-русски кратко и нейтрально.
Используй сведения карточки препарата и общую справочную информацию. Не ставь диагноз,
не назначай лечение, не подбирай персональную дозировку и не заменяй врача или фармацевта.
При медицинском решении объясни ограничение и посоветуй обратиться к специалисту."""


def asks_for_medical_decision(text):
    normalized = text.lower()
    phrases = (
        "что мне принимать", "как мне принимать", "какую дозу", "моя дозировка",
        "поставь диагноз", "чем мне лечить", "можно ли мне", "назначь лечение",
        "беременн", "ребенку доз", "замени врача",
    )
    return any(phrase in normalized for phrase in phrases)


def generate_medicine_answer(medicine, question):
    if asks_for_medical_decision(question):
        return (
            "Я могу дать только общую справочную информацию о препарате, но не могу "
            "подбирать лечение или персональную дозировку. Обратитесь к врачу или фармацевту."
        )
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    context = (
        f"Название: {medicine.name}\nДействующее вещество: {medicine.active_ingredient or 'не указано'}\n"
        f"Дозировка: {medicine.dosage or 'не указана'}\nФорма: {medicine.form or 'не указана'}\n"
        f"Производитель: {medicine.manufacturer or 'не указан'}\nОписание: {medicine.description or 'нет'}"
    )
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": f"Карточка препарата:\n{context}\n\nВопрос: {question}"}]}],
        "generationConfig": {"temperature": 0.25, "maxOutputTokens": 700},
    }
    query = parse.urlencode({"key": settings.GEMINI_API_KEY})
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?{query}"
    http_request = request.Request(url, data=json.dumps(body).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(http_request, timeout=25) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (error.HTTPError, error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("Gemini service is unavailable") from exc
    candidates = payload.get("candidates") or []
    parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
    answer = "\n".join(part.get("text", "") for part in parts).strip()
    if not answer:
        raise RuntimeError("Gemini returned an empty response")
    return answer
