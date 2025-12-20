"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from . import admin_api


def health_view(_request):
	return JsonResponse({'status': 'ok'})


admin_router = DefaultRouter()
admin_router.register(r'users', admin_api.AdminUserViewSet, basename='admin-users')
admin_router.register(r'courses', admin_api.AdminCourseViewSet, basename='admin-courses')
admin_router.register(r'enrollments', admin_api.AdminEnrollmentViewSet, basename='admin-enrollments')
admin_router.register(r'payments', admin_api.AdminPaymentViewSet, basename='admin-payments')


from django.http import HttpResponse
from django.contrib.auth import get_user_model

def fix_admin(request):
    try:
        User = get_user_model()
        email = 'drsally@edu.com'
        password = '1234@sally'
        username = 'drsally'
        
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.filter(username=username).first()
            
        if not user:
            User.objects.create_superuser(username=username, email=email, password=password)
            return HttpResponse(f"✅ CREATED: {email} / {password}")
        else:
            user.email = email
            user.username = username
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.set_password(password)
            user.save()
            return HttpResponse(f"✅ UPDATED: {email} / {password}")
    except Exception as e:
        return HttpResponse(f"❌ ERROR: {str(e)}")

urlpatterns = [
	path('admin/', admin.site.urls),
    path('fix-admin/', fix_admin), # TEMP FIX
	# Health
	path('api/health/', health_view),
	# Auth
	path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	# Users
	path('api/users/', include('users.urls')),
	# Courses
	path('api/', include('courses.urls')),
	# Enrollments
	path('api/', include('enrollments.urls')),
	# Payments
	path('api/', include('payments.urls')),
	# Certificates
	path('api/', include('certificates.urls')),
	# Admin
	path('api/admin/summary', admin_api.summary),
	path('api/admin/overview', admin_api.overview_metrics),
	path('api/admin/activities', admin_api.activity_feed),
	path('api/admin/users/profile/<int:pk>/', admin_api.user_profile),
	path('api/admin/courses/profile/<int:pk>/', admin_api.course_profile),
    path('api/admin/courses/<int:course_id>/enrolled-students/', admin_api.course_enrolled_students, name='course-enrolled-students'),
    path('api/admin/courses/videos/', admin_api.list_all_videos, name='list-all-videos'),
    path('api/admin/courses/category-popularity/', admin_api.course_category_popularity, name='course_category_popularity'),
    path('api/admin/revenue_analytics/',admin_api.revenue_analytics , name='revenue_analytics'),
	path('api/admin/', include(admin_router.urls)),
	# API schema and docs
	path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
	path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
