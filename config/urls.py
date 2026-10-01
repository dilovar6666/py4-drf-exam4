from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .docs import openapi_schema, redoc, swagger_ui


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("pharmacies.urls")),
    path("api/", include("medicines.urls")),
    path("api/", include("reservations.urls")),
    path("api/", include("reviews.urls")),
    path("api/", include("chats.urls")),
    path("api/", include("notifications.urls")),
]

urlpatterns += [
    path("api/schema/", openapi_schema, name="schema"),
    path("api/docs/", swagger_ui, name="swagger-ui"),
    path("api/redoc/", redoc, name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
