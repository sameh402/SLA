from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
	list_display = ( 'user', 'course', 'issued_at', 'certificate_url' )
	list_filter = ( 'issued_at', )
	search_fields = ( 'user__username', 'course__title', 'certificate_url' )
	readonly_fields = ( 'issued_at', )
