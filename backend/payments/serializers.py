


from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Payment

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_name', 'course', 'course_title',
            'amount', 'currency', 'payment_status', 'transaction_id', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'payment_status', 'created_at',
            'transaction_id', 'user_name', 'course_title'
        ]

    def get_user_name(self, obj):
        user = obj.user
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        elif user.first_name:
            return user.first_name
        return user.username

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def validate_currency(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Invalid currency.")
        return value.upper()

