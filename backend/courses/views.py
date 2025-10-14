# from django.shortcuts import render, get_object_or_404
# from rest_framework import viewsets, permissions, filters, status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend
# from .models import Course, CourseMedia
# from .serializers import CourseSerializer, CourseMediaSerializer
# from .permissions import IsInstructorOrAdmin
# from rest_framework.views import APIView

# class CourseMediaDeleteView(APIView):
#     permission_classes = [IsInstructorOrAdmin]
#     def delete(self, request, course_id, media_id):
#         try:
#             # Ensure the media belongs to this course
#             media = CourseMedia.objects.get(id=media_id, course_id=course_id)
#             media.delete()
#             return Response({"message": "Media deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
#         except CourseMedia.DoesNotExist:
#             return Response({"error": "Media not found"}, status=status.HTTP_404_NOT_FOUND)

# # Create your views here.

# class CourseViewSet(viewsets.ModelViewSet):
# 	serializer_class = CourseSerializer
# 	queryset = Course.objects.all()
# 	permission_classes = [IsInstructorOrAdmin]
# 	filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
# 	filterset_fields = ['status', 'created_by']
# 	search_fields = ['title', 'description']
# 	ordering_fields = ['created_at', 'price']

# 	def get_permissions(self):
# 		if self.action in ['list', 'retrieve']:
# 			return [permissions.AllowAny()]
# 		return super().get_permissions()

# 	def get_queryset(self):
# 		qs = super().get_queryset()
# 		user = self.request.user
# 		if self.action == 'list':
# 			# Instructors see only their courses; admins see all; public sees published
# 			if user and user.is_authenticated:
# 				if getattr(user, 'role', None) == 'instructor':
# 					return qs.filter(created_by=user)
# 				if getattr(user, 'role', None) == 'admin':
# 					return qs
# 			return qs.filter(status=Course.Status.PUBLISHED)
# 		if self.action == 'retrieve':
# 			# Public can retrieve published; instructors/admins can retrieve any
# 			return qs
# 		return qs


# class CourseMediaViewSet(viewsets.ModelViewSet):
# 	serializer_class = CourseMediaSerializer
# 	queryset = CourseMedia.objects.all()
# 	permission_classes = [IsInstructorOrAdmin]
# 	filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
# 	filterset_fields = ['course', 'media_type']
# 	ordering_fields = ['order', 'created_at']

# 	def get_permissions(self):
# 		# Read: any authenticated user, filtered by enrollment; Write: instructor/admin
# 		if self.action in ['list', 'retrieve']:
# 			return [permissions.IsAuthenticated()]
# 		return [IsInstructorOrAdmin()]

# 	def get_queryset(self):
# 		qs = CourseMedia.objects.all()
# 		user = self.request.user
# 		if not user or not user.is_authenticated:
# 			return CourseMedia.objects.none()
# 		# Admin sees all
# 		if getattr(user, 'role', None) == 'admin':
# 			return qs
# 		# Instructor sees only media for their courses
# 		if getattr(user, 'role', None) == 'instructor':
# 			return qs.filter(course__created_by=user)
# 		# Students: only media for courses they are enrolled in
# 		return qs.filter(course__enrollments__user=user)


# @api_view(['POST'])
# @permission_classes([IsInstructorOrAdmin])
# def add_course_media(request, course_id):
#     """
#     Add media to a specific course
#     """
#     try:
#         # Get the course
#         course = get_object_or_404(Course, id=course_id)
        
#         # Check permissions
#         user = request.user
#         if getattr(user, 'role', None) != 'admin' and course.created_by != user:
#             return Response({"detail": "You do not have permission to add media to this course"}, 
#                            status=status.HTTP_403_FORBIDDEN)
        
#         # Print request data for debugging
#         print(f"Request data: {request.data}")
#         print(f"Request FILES: {request.FILES}")
        
#         # Create a mutable copy of the data
#         data = request.data.copy()
        
#         # Ensure course ID is set correctly (from URL parameter)
#         data['course'] = course_id
        
#         # Create a new serializer with course already set
#         serializer = CourseMediaSerializer(data=data)
#         if serializer.is_valid():
#             # Save with explicit course assignment
#             serializer.save(course=course)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#         # Print validation errors for debugging
#         print(f"Validation errors: {serializer.errors}")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     except Exception as e:
#         print(f"Error in add_course_media: {str(e)}")
#         return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from .models import Course, CourseMedia
from .serializers import CourseSerializer, CourseMediaSerializer
from .permissions import IsInstructorOrAdmin


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
