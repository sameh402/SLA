# from rest_framework import serializers
# from .models import Course, CourseMedia


# class CourseMediaSerializer(serializers.ModelSerializer):
# 	class Meta:
# 		model = CourseMedia
# 		fields = ['id', 'course', 'file', 'media_type', 'title', 'order', 'is_preview', 'duration', 'created_at']
# 		read_only_fields = ['id', 'created_at']
		
# 	def validate(self, attrs):
# 		# Print received data for debugging
# 		print(f"CourseMediaSerializer received data: {attrs}")
# 		return super().validate(attrs)


# class CourseSerializer(serializers.ModelSerializer):
# 	created_by = serializers.ReadOnlyField(source='created_by.id')
# 	videos_count=serializers.SerializerMethodField()
 
    
# 	class Meta:
# 		model = Course
# 		fields = [
#             'id', 'title', 'description', 'status', 'price',
#             'category', 'duration', 'next_course_recommendation',
#             'instructors', 'thumbnail', 'created_by',
#             'created_at', 'updated_at', 'media' ,'videos_count'
#         ]
# 		# fields = ['id', 'title', 'description', 'status', 'price', 'thumbnail', 'created_by', 'created_at', 'updated_at', 'media']
# 		read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

# 	def create(self, validated_data):
# 		request = self.context.get('request')
# 		if request and request.user and request.user.is_authenticated:
# 			validated_data['created_by'] = request.user
# 		return super().create(validated_data)

# 	def get_videos_count(self, obj):
# 		return obj.media.filter(media_type='video').count()



from rest_framework import serializers
from .models import Course, CourseMedia


class CourseMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMedia
        fields = [
            'id', 'course', 'file', 'media_type', 'title',
            'order', 'is_preview', 'duration', 'session', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CourseSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.id')
    videos_count = serializers.SerializerMethodField()
    media = CourseMediaSerializer(many=True, read_only=True)
    thumbnail = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'status', 'price',
            'category', 'duration', 'next_course_recommendation',
            'instructors', 'thumbnail', 'created_by',
            'created_at', 'updated_at', 'media', 'videos_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_instructors(self, value):
        """
        Ensure instructors is always a list of strings.
        """
        import json
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for instructors.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Instructors must be a list.")
        return value

    def get_videos_count(self, obj):
        return obj.media.filter(media_type='video').count()

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Explicitly handle instructors updates
        instructors = validated_data.pop('instructors', None)
        if instructors is not None:
            instance.instructors = instructors
        return super().update(instance, validated_data)

