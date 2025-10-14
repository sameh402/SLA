from django.contrib import admin
from .models import Course, CourseMedia


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
	list_display = ( 'title', 'status', 'price', 'created_by', 'created_at' )
	list_filter = ( 'status', 'created_at', 'created_by' )
	search_fields = ( 'title', 'description' )
	readonly_fields = ( 'created_at', 'updated_at' )


@admin.register(CourseMedia)
class CourseMediaAdmin(admin.ModelAdmin):
	list_display = ( 'course', 'title', 'media_type', 'order', 'created_at' )
	list_filter = ( 'media_type', )
	search_fields = ( 'title', 'course__title' )
	readonly_fields = ( 'created_at', )
