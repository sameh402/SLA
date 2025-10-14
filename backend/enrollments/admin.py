from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
	list_display = ( 'user', 'course', 'status', 'progress', 'created_at' )
	list_filter = ( 'status', 'created_at' )
	search_fields = ( 'user__username', 'course__title' )
	readonly_fields = ( 'created_at', 'updated_at' )
