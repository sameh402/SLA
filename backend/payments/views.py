# import uuid
# import requests
# from django.conf import settings
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse
# from django.shortcuts import redirect
# from rest_framework import viewsets, permissions, mixins, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from .models import Payment
# from .serializers import PaymentSerializer
# from .services import create_tap_charge


# class PaymentViewSet(mixins.CreateModelMixin,
#                      mixins.ListModelMixin,
#                      viewsets.GenericViewSet):
#     serializer_class = PaymentSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         return Payment.objects.filter(user=self.request.user)

#     def perform_create(self, serializer):
#         transaction_id = uuid.uuid4().hex
#         user = self.request.user
#         data = self.request.data

#         # 🧠 Currency Detection
#         currency = data.get("currency")
#         if not currency:
#             ip = self.request.META.get("REMOTE_ADDR")
#             try:
#                 res = requests.get(f"https://ipapi.co/{ip}/json/")
#                 currency = res.json().get("currency", "USD").upper()
#             except Exception:
#                 currency = "USD"

#         serializer.save(user=user, transaction_id=transaction_id, currency=currency)

#     @action(detail=True, methods=["post"])
#     def pay(self, request, pk=None):
#         payment = self.get_object()
#         redirect_url = f"http://localhost:8000/api/payments/tap/callback/"

#         response = create_tap_charge(
#             amount=payment.amount,
#             currency=payment.currency,
#             customer_name=request.user.first_name or request.user.username,
#             customer_email=request.user.email or "test@example.com",
#             redirect_url=redirect_url,
#             description=f"Payment for course {payment.course.title}"
#         )

#         if response.status_code != 200:
#             return Response({"error": response.text}, status=status.HTTP_400_BAD_REQUEST)

#         data = response.json()
#         payment.transaction_id = data["id"]
#         payment.save(update_fields=["transaction_id"])
#         return Response({"redirect_url": data["transaction"]["url"]})


# @csrf_exempt
# def tap_callback(request):
#     tap_id = request.GET.get("tap_id")
#     if not tap_id:
#         return JsonResponse({"error": "Missing tap_id"}, status=400)

#     headers = {"Authorization": f"Bearer {settings.TAP_API_KEY}"}
#     resp = requests.get(f"{settings.TAP_API_URL}/charges/{tap_id}", headers=headers)
#     data = resp.json()

#     print("========== TAP CALLBACK ==========")
#     print(data)
#     print("=================================")

#     payment_status = Payment.Status.FAILED

#     try:
#         payment = Payment.objects.get(transaction_id=tap_id)

#         if data.get("status") == "CAPTURED":
#             payment_status = Payment.Status.SUCCESS
#             payment.payment_status = payment_status
#             payment.save(update_fields=["payment_status"])

#             # ✅ Enroll user automatically
#             from enrollments.models import Enrollment
#             Enrollment.objects.get_or_create(
#                 user=payment.user,
#                 course=payment.course,
#                 defaults={"status": Enrollment.Status.ACTIVE, "progress": 0}
#             )
#         else:
#             payment.payment_status = Payment.Status.FAILED
#             payment.save(update_fields=["payment_status"])

#     except Payment.DoesNotExist:
#         print(f"⚠️ Payment with transaction_id={tap_id} not found")

#     return redirect(f"http://localhost:8080/payment-result?status={payment_status}")
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
from .services import create_tap_charge
import uuid, requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


class PaymentViewSet(mixins.CreateModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        transaction_id = uuid.uuid4().hex
        user = self.request.user
        data = self.request.data

        # 🧠 Currency Detection
        currency = data.get("currency")
        if not currency:
            ip = self.request.META.get("REMOTE_ADDR")
            try:
                res = requests.get(f"https://ipapi.co/{ip}/json/")
                currency = res.json().get("currency", "USD").upper()
            except Exception:
                currency = "USD"

        serializer.save(user=user, transaction_id=transaction_id, currency=currency)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        payment = self.get_object()

        # ✅ use backend domain for callback
        redirect_url = f"{settings.BACKEND_URL}/api/payments/tap/callback/"

        response = create_tap_charge(
            amount=payment.amount,
            currency=payment.currency,
            customer_name=request.user.first_name or request.user.username,
            customer_email=request.user.email or "test@example.com",
            redirect_url=redirect_url,
            description=f"Payment for course {payment.course.title}"
        )

        if response.status_code != 200:
            return Response({"error": response.text}, status=status.HTTP_400_BAD_REQUEST)

        data = response.json()
        payment.transaction_id = data["id"]
        payment.save(update_fields=["transaction_id"])

        # ✅ redirect user to payment page
        return Response({"redirect_url": data["transaction"]["url"]})


@csrf_exempt
def tap_callback(request):
    tap_id = request.GET.get("tap_id")
    if not tap_id:
        return JsonResponse({"error": "Missing tap_id"}, status=400)

    headers = {"Authorization": f"Bearer {settings.TAP_API_KEY}"}
    resp = requests.get(f"{settings.TAP_API_URL}/charges/{tap_id}", headers=headers)
    data = resp.json()

   
    payment_status = Payment.Status.FAILED

    try:
        payment = Payment.objects.get(transaction_id=tap_id)

        if data.get("status") == "CAPTURED":
            payment_status = Payment.Status.SUCCESS
            payment.payment_status = payment_status
            payment.save(update_fields=["payment_status"])

            # ✅ Enroll user automatically
            from enrollments.models import Enrollment
            Enrollment.objects.get_or_create(
                user=payment.user,
                course=payment.course,
                defaults={"status": Enrollment.Status.ACTIVE, "progress": 0}
            )
        else:
            payment.payment_status = Payment.Status.FAILED
            payment.save(update_fields=["payment_status"])

    except Payment.DoesNotExist:
        print(f"⚠️ Payment with transaction_id={tap_id} not found")

    # ✅ redirect to frontend domain dynamically with course ID
    course_id = ""
    try:
        if payment:
            course_id = f"&courseId={payment.course.id}"
    except:
        pass
    
    return redirect(f"{settings.FRONTEND_URL}/payment-result?status={payment_status}{course_id}")
