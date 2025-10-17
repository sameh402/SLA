
    
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from .models import Course, CourseMedia
from .serializers import CourseSerializer, CourseMediaSerializer
from .permissions import IsInstructorOrAdmin
from rest_framework.permissions import IsAuthenticated
from enrollments.models import Enrollment



# ✅ COURSE CRUD
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    queryset = Course.objects.all().prefetch_related('media')
    permission_classes = [IsInstructorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'created_by']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['created_at', 'price']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if self.action == 'list':
            # Instructors see their courses, Admin sees all, public sees published
            if user.is_authenticated:
                if getattr(user, 'role', None) == 'instructor':
                    return qs.filter(created_by=user)
                if getattr(user, 'role', None) == 'admin':
                    return qs
            return qs.filter(status=Course.Status.PUBLISHED)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ✅ COURSE MEDIA CRUD
class CourseMediaViewSet(viewsets.ModelViewSet):
    serializer_class = CourseMediaSerializer
    queryset = CourseMedia.objects.all()
    permission_classes = [IsInstructorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'media_type']
    ordering_fields = ['order', 'created_at']

    def get_queryset(self):
        user = self.request.user
        qs = CourseMedia.objects.all()

        if not user.is_authenticated:
            return CourseMedia.objects.none()
        if getattr(user, 'role', None) == 'admin':
            return qs
        if getattr(user, 'role', None) == 'instructor':
            return qs.filter(course__created_by=user)
        return qs.none()  # Students see media through course detail only

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        user = self.request.user
        if course.created_by != user and getattr(user, 'role', None) != 'admin':
            raise permissions.PermissionDenied("You can only add media to your own courses.")
        serializer.save()


# ✅ Add media to course (simplified helper endpoint)
@api_view(['POST'])
@permission_classes([IsInstructorOrAdmin])
def add_course_media(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    if course.created_by != request.user and getattr(request.user, 'role', None) != 'admin':
        return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    serializer = CourseMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Delete course media
class CourseMediaDeleteView(APIView):
    permission_classes = [IsInstructorOrAdmin]

    def delete(self, request, course_id, media_id):
        media = get_object_or_404(CourseMedia, id=media_id, course_id=course_id)
        if media.course.created_by != request.user and getattr(request.user, 'role', None) != 'admin':
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        media.delete()
        return Response({"message": "Media deleted successfully"}, status=status.HTTP_204_NO_CONTENT)



# New Course Detail Endpoint for Authenticated Users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_course_detail(request, course_id):
    try:
        course = Course.objects.prefetch_related("media").get(id=course_id)
    except Course.DoesNotExist:
        return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    is_enrolled = Enrollment.objects.filter(
        user=request.user, course=course, status="active"
    ).exists()
    serializer = CourseSerializer(course, context={"request": request})
    course_data = serializer.data
    students_count = Enrollment.objects.filter(course=course, status__in=["active", "completed"]).count() 
    instructors = course.instructors if isinstance(course.instructors, list) else []
    next_course = (
        Course.objects.filter(category=course.category)
        .exclude(id=course.id)
        .first()
    )
    if not next_course:
        # fallback: pick any random course
        next_course = Course.objects.exclude(id=course.id).order_by("?").first()

    next_course_data = None
    if next_course:
        next_course_data = {
            "id": next_course.id,
            "title": next_course.title,
            "thumbnail": request.build_absolute_uri(next_course.thumbnail.url)
            if next_course.thumbnail
            else None,
            "price": float(next_course.price),
            "category": next_course.category,
        }

    # ✅ Combine everything for frontend
    response_data = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "thumbnail": request.build_absolute_uri(course.thumbnail.url) if course.thumbnail else None,
        "price": float(course.price),
        "category": course.category if hasattr(course, "category") else "General",
        "status": course.status,
        "duration": course.duration,
        "instructors": instructors,
        "media": course_data.get("media", []),
        "is_enrolled": is_enrolled,
        "user": request.user.username,
        "rating": 4.6,  
        "students_count": students_count,
        "next_recommended_course": next_course_data,
    }

    return Response(response_data, status=status.HTTP_200_OK)
