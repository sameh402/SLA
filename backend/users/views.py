from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer
from .permissions import IsSelfOrAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
	serializer_class = RegisterSerializer
	permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin]

	def get_object(self):
		return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
	serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
	if serializer.is_valid():
		user = request.user
		user.set_password(serializer.validated_data['new_password'])
		user.save()
		return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
