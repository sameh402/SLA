from django.urls import path
from .views import RegisterView, ProfileView, change_password, check_username

urlpatterns = [
	path('register/', RegisterView.as_view(), name='register'),
	path('profile/', ProfileView.as_view(), name='profile'),
	path('change-password/', change_password, name='change_password'),
	path('check-username/', check_username, name='check_username'),
]
