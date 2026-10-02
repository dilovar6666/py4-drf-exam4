from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomUserDetailView,
    CustomUserListCreateView,
    MeView,
    RegisterView,
    ResendEmailCodeView,
    VerifyEmailView,
    VerifiedTokenObtainPairView,
)


urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", VerifiedTokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/verify-email/", VerifyEmailView.as_view()),
    path("auth/resend-email-code/", ResendEmailCodeView.as_view()),
    path("auth/me/", MeView.as_view()),
    path("users/", CustomUserListCreateView.as_view()),
    path("users/<int:pk>/", CustomUserDetailView.as_view()),
]
