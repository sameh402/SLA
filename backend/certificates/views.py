from urllib.parse import quote
from django.conf import settings
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from enrollments.models import Enrollment
from .models import Certificate
from .serializers import CertificateSerializer


class CertificateViewSet(mixins.ListModelMixin,
                         viewsets.GenericViewSet):
	serializer_class = CertificateSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Certificate.objects.filter(user=self.request.user)

	@action(detail=False, methods=['post'])
	def generate(self, request):
		course_id = request.data.get('course')
		if not course_id:
			return Response({'detail': 'course is required'}, status=status.HTTP_400_BAD_REQUEST)
		# Only allow if enrollment completed
		if not Enrollment.objects.filter(user=request.user, course_id=course_id, status=Enrollment.Status.COMPLETED).exists():
			return Response({'detail': 'Course not completed'}, status=status.HTTP_400_BAD_REQUEST)
		certificate, _ = Certificate.objects.get_or_create(
			user=request.user,
			course_id=course_id,
			defaults={
				'certificate_url': f"/media/certificates/{quote(str(request.user.id))}-{quote(str(course_id))}.pdf",
			}
		)
		return Response(CertificateSerializer(certificate).data, status=status.HTTP_201_CREATED)
