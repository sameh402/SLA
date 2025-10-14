from django.conf import settings
from django.db import models
from courses.models import Course


class Certificate(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
	course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
	issued_at = models.DateTimeField(auto_now_add=True)
	certificate_url = models.URLField(max_length=500)

	class Meta:
		unique_together = ('user', 'course')
		ordering = ['-issued_at']

	def __str__(self) -> str:
		return f"Certificate {self.user_id}-{self.course_id}"
