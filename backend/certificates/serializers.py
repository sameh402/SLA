from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Certificate
		fields = ['id', 'user', 'course', 'issued_at', 'certificate_url']
		read_only_fields = ['id', 'user', 'issued_at']

