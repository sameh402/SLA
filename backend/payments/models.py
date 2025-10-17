from django.conf import settings
from django.db import models
from courses.models import Course


class Payment(models.Model):
	class Status(models.TextChoices):
		PENDING = 'pending', 'Pending'
		SUCCESS = 'success', 'Success'
		FAILED = 'failed', 'Failed'

	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
	course = models.ForeignKey(Course, on_delete=models.CASCADE , related_name='payments')
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	currency = models.CharField(max_length=10, default='USD')
	payment_status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
	transaction_id = models.CharField(max_length=128, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self) -> str:
		return f"{self.transaction_id} {self.payment_status}"
