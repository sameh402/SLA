from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
	def has_permission(self, request, view):
		return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsInstructor(BasePermission):
	def has_permission(self, request, view):
		return bool(request.user and request.user.is_authenticated and request.user.role in ['instructor', 'admin'])


class IsSelfOrAdmin(BasePermission):
	def has_object_permission(self, request, view, obj):
		if request.method in SAFE_METHODS:
			return True
		return bool(request.user and request.user.is_authenticated and (obj == request.user or request.user.role == 'admin'))

