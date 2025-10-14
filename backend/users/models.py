from django.contrib.auth.models import AbstractUser
from django.db import models
class User(AbstractUser):
    class Roles(models.TextChoices):
        STUDENT = 'student', 'Student'
        INSTRUCTOR = 'instructor', 'Instructor'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(max_length=32, choices=Roles.choices, default=Roles.STUDENT)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    age = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
	