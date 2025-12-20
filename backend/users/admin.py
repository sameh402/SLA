from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Profile Info', {'fields': ('role', 'avatar', 'bio', 'country', 'phone', 'address', 'age')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'country', 'phone', 'age', 'is_staff', 'password')
