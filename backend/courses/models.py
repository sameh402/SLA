from django.conf import settings
from django.db import models


class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        # ARCHIVED = 'archived', 'Archived'

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True) # as field
    duration = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    next_course_recommendation = models.CharField(max_length=255, blank=True)
    instructors = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    def __str__(self):
        return self.title




from django.utils.text import slugify
from .storage import HostingerVideoStorage

def course_media_path(instance, filename):
    # Clean up the course title to be used as a folder name
    course_slug = slugify(instance.course.title)
    # Return the path: courses/course-title/filename
    return f'courses/{course_slug}/{filename}'

class CourseMedia(models.Model):
	class MediaTypes(models.TextChoices):
		VIDEO = 'video', 'Video'
		PDF = 'pdf', 'PDF'
		IMAGE = 'image', 'Image'
		AUDIO = 'audio', 'Audio'
		OTHER = 'other', 'Other'

	course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='media')
	file = models.FileField(upload_to=course_media_path, storage=HostingerVideoStorage())
	media_type = models.CharField(max_length=20, choices=MediaTypes.choices)
	title = models.CharField(max_length=255)
	order = models.PositiveIntegerField(default=0)
	duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in seconds (for video/audio)")
	is_preview = models.BooleanField(default=False, help_text="Whether this content is available as preview")
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['order', 'id']

	def __str__(self) -> str:
		return f"{self.course_id} - {self.title}"
