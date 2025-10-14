from rest_framework import serializers
from .models import Enrollment
from courses.serializers import CourseSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class EnrollmentSerializer(serializers.ModelSerializer):
	course_detail = CourseSerializer(source='course', read_only=True)
	user_name = serializers.SerializerMethodField()
	course_title = serializers.SerializerMethodField()

	class Meta:
		model = Enrollment
		fields = ['id', 'user', 'user_name', 'course', 'course_title', 'course_detail', 'status', 'progress', 'created_at', 'updated_at']
		read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'user_name', 'course_title']
	
	def get_user_name(self, obj):
		user = obj.user
		if user.first_name and user.last_name:
			return f"{user.first_name} {user.last_name}"
		elif user.first_name:
			return user.first_name
		return user.username
	
	def get_course_title(self, obj):
		return obj.course.title if obj.course else None
