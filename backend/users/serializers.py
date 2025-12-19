from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from enrollments.models import Enrollment


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'avatar', 'bio', 'country', 'phone', 'address', 'age'
        ]
        read_only_fields = ['id', 'role', 'username', 'email']


class ChangePasswordSerializer(serializers.Serializer):
	current_password = serializers.CharField(required=True)
	new_password = serializers.CharField(required=True)

	def validate_current_password(self, value):
		user = self.context['request'].user
		if not authenticate(username=user.username, password=value):
			raise serializers.ValidationError("Current password is incorrect.")
		return value

	def validate_new_password(self, value):
		if len(value) < 8:
			raise serializers.ValidationError("New password must be at least 8 characters long.")
		return value




class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'country', 'phone', 'address', 'age'
        ]

    def create(self, validated_data):
        # Use email as username if username is not provided
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
            
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# class AdminUserSerializer(serializers.ModelSerializer):
# 	password = serializers.CharField(write_only=True, required=False, allow_blank=True)
	


# 	class Meta:
# 		model = User
# 		fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role','country','phone', 'is_active', 'is_staff', 'password', 'date_joined']
# 		read_only_fields = ['id']

# 	def create(self, validated_data):
# 		password = validated_data.pop('password', None)
# 		user = User(**validated_data)
# 		if password:
# 			user.set_password(password)
# 		else:
# 			user.set_unusable_password()
# 		user.save()
# 		return user

# 	def update(self, instance, validated_data):
# 		password = validated_data.pop('password', None)
# 		for attr, value in validated_data.items():
# 			setattr(instance, attr, value)
# 		if password:
# 			instance.set_password(password)
# 		instance.save()
# 		return instance




class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    courses_enrolled = serializers.SerializerMethodField()  # ✅ add this

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'country', 'phone', 'is_active', 'is_staff', 'password', 
            'date_joined', 'courses_enrolled',  # ✅ add this
        ]
        read_only_fields = ['id']

    def get_courses_enrolled(self, obj):
        """Return all courses this student is enrolled in with category info."""
        if obj.role != 'student':
            return []

        enrollments = Enrollment.objects.filter(user=obj).select_related('course')
        return [
            {
                "title": e.course.title,
                "category": e.course.category or "Uncategorized",
                "next_recommendation": e.course.next_course_recommendation or "N/A"
            }
            for e in enrollments
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
