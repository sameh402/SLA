from django.db import models
from django.conf import settings

class SupportTicket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='support_tickets'
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.OPEN
    )
    admin_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} - {self.user.username} ({self.status})"

    class Meta:
        ordering = ['-created_at']
