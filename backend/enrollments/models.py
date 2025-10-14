from django.conf import settings
from django.db import models
from courses.models import Course


class Enrollment(models.Model):
	class Status(models.TextChoices):
		ACTIVE = 'active', 'Active'
		COMPLETED = 'completed', 'Completed'

	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
	course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
	status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
	progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
	enrolled_at = models.DateTimeField(auto_now_add=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ('user', 'course')
		ordering = ['-created_at']

	def __str__(self) -> str:
		return f"{self.user_id}->{self.course_id} {self.status} {self.progress}%"
