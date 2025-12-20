from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'user_email', 'user_username', 
            'subject', 'message', 'status', 
            'admin_reply', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
