from django.shortcuts import render
from django.db import IntegrityError
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Enrollment
from .serializers import EnrollmentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count ,Q
from courses.models import Course


# Create your views here.

class EnrollmentViewSet(mixins.CreateModelMixin,
                        mixins.ListModelMixin,
                        mixins.UpdateModelMixin,
                        viewsets.GenericViewSet):
	serializer_class = EnrollmentSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Enrollment.objects.filter(user=self.request.user)

	def create(self, request, *args, **kwargs):
		# Check if user is already enrolled in this course
		course_id = request.data.get('course')
		if course_id:
			existing_enrollment = Enrollment.objects.filter(
				user=request.user,
				course_id=course_id
			).first()
			
			if existing_enrollment:
				# Return existing enrollment instead of creating duplicate
				serializer = self.get_serializer(existing_enrollment)
				return Response(serializer.data, status=status.HTTP_200_OK)
		
		# If no existing enrollment, proceed with creation
		return super().create(request, *args, **kwargs)

	def perform_create(self, serializer):
		try:
			serializer.save(user=self.request.user)
		except IntegrityError:
			# Handle race condition where enrollment might be created between check and save
			course_id = serializer.validated_data.get('course').id
			existing_enrollment = Enrollment.objects.get(
				user=self.request.user,
				course_id=course_id
			)
			# Update the serializer instance to the existing enrollment
			serializer.instance = existing_enrollment

	@action(detail=True, methods=['post'])
	def progress(self, request, pk=None):
		enrollment = self.get_object()
		progress_value = request.data.get('progress')
		try:
			progress_value = float(progress_value)
		except (TypeError, ValueError):
			return Response({'detail': 'Invalid progress value'}, status=status.HTTP_400_BAD_REQUEST)
		enrollment.progress = max(0, min(100, progress_value))
		if enrollment.progress >= 100:
			enrollment.status = Enrollment.Status.COMPLETED
		enrollment.save(update_fields=['progress', 'status'])
		return Response(EnrollmentSerializer(enrollment).data)





