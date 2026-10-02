from django.contrib import admin

from .models import CustomUser, EmailVerificationCode


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_email_verified", "is_staff", "created_at")
    list_filter = ("role", "is_email_verified", "is_staff")
    search_fields = ("username", "email", "phone")


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "expires_at", "is_used")
    list_filter = ("is_used",)
