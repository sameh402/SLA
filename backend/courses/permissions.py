from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsInstructorOrAdmin(BasePermission):
	def has_permission(self, request, view):
		if request.method in SAFE_METHODS:
			return True
		return bool(request.user and request.user.is_authenticated and request.user.role in ['instructor', 'admin'])

	def has_object_permission(self, request, view, obj):
		if request.method in SAFE_METHODS:
			return True
		return bool(request.user and request.user.is_authenticated and (request.user.role in ['instructor', 'admin']) and (obj.created_by == request.user or request.user.role == 'admin'))

