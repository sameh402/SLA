

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, tap_callback

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path("payments/tap/callback/", tap_callback, name="tap_callback"),
] + router.urls
