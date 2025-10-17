# from django.urls import path
# from rest_framework.routers import DefaultRouter
# from .views import CourseViewSet, CourseMediaViewSet, add_course_media , CourseMediaDeleteView

# router = DefaultRouter()
# router.register(r'courses', CourseViewSet, basename='course')
# router.register(r'course-media', CourseMediaViewSet, basename='course-media')

# urlpatterns = router.urls + [
#     path('courses/<int:course_id>/media/', add_course_media, name='add-course-media'),
#     path('courses/<int:course_id>/media/<int:media_id>/', CourseMediaDeleteView.as_view(), name='delete-course-media'),
# ]

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseMediaViewSet, add_course_media, CourseMediaDeleteView ,user_course_detail

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'course-media', CourseMediaViewSet, basename='course-media')

urlpatterns = router.urls + [
    path('courses/<int:course_id>/media/', add_course_media, name='add-course-media'),
    path('courses/<int:course_id>/media/<int:media_id>/', CourseMediaDeleteView.as_view(), name='delete-course-media'),
    path('courses/<int:course_id>/media/', add_course_media, name='add-course-media'),
    path('courses/<int:course_id>/media/<int:media_id>/', CourseMediaDeleteView.as_view(), name='delete-course-media'),
    path("courses/user-course/<int:course_id>/", user_course_detail, name="user-course-detail"),
]
