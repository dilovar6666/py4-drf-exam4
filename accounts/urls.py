from django.urls import path

from .views import CustomUserDetailView, CustomUserListCreateView


urlpatterns = [
    path("users/", CustomUserListCreateView.as_view()),
    path("users/<int:pk>/", CustomUserDetailView.as_view()),
]
