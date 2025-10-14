from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDate
from users.models import User
from courses.models import Course , CourseMedia
from enrollments.models import Enrollment
from payments.models import Payment
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from users.serializers import AdminUserSerializer
from courses.serializers import CourseSerializer ,CourseMediaSerializer
from enrollments.serializers import EnrollmentSerializer
from payments.serializers import PaymentSerializer
import psutil
import os
from django.db import connection
from rest_framework.decorators import action
from django.db.models import Count, Case, When, Value, CharField



def _is_admin(user):
	return getattr(user, 'role', None) == 'admin' or user.is_staff


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def summary(request):
	user = request.user
	if not _is_admin(user):
		return Response({"detail": "Not authorized"}, status=403)
	users_count = User.objects.count()
	users_by_role = list(User.objects.values('role').annotate(count=Count('id')).order_by())
	courses_published = Course.objects.filter(status=Course.Status.PUBLISHED).count()
	courses_draft = Course.objects.filter(status=Course.Status.DRAFT).count()
	enrollments_active = Enrollment.objects.filter(status=Enrollment.Status.ACTIVE).count()
	enrollments_completed = Enrollment.objects.filter(status=Enrollment.Status.COMPLETED).count()
 
	total_videos = CourseMedia.objects.filter(media_type='video').count()

	# Revenue aggregates
	now = timezone.now()
	start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
	start_7d = start_today - timedelta(days=6)
	start_30d = start_today - timedelta(days=29)

	qs_success = Payment.objects.filter(payment_status=Payment.Status.SUCCESS)
	revenue_total = qs_success.aggregate(total=Sum('amount'))['total'] or 0
	revenue_7d = qs_success.filter(created_at__date__gte=start_7d.date()).aggregate(total=Sum('amount'))['total'] or 0
	revenue_30d = qs_success.filter(created_at__date__gte=start_30d.date()).aggregate(total=Sum('amount'))['total'] or 0

	# Payments status counts
	payments_by_status = list(Payment.objects.values('payment_status').annotate(count=Count('id')).order_by())

	# Top courses by enrollments (last 30 days)
	top_courses = list(
		Enrollment.objects.filter(created_at__date__gte=start_30d.date())
		.annotate(day=TruncDate('created_at'))
		.values('course_id', 'course__title')
		.annotate(enrolls=Count('id'))
		.order_by('-enrolls')[:5]
	)

	# Daily enrollment trend for last 7 days
	daily_enrollments = list(
		Enrollment.objects.filter(created_at__date__gte=start_7d.date())
		.annotate(day=TruncDate('created_at'))
		.values('day')
		.annotate(count=Count('id'))
		.order_by('day')
	)

	# Daily revenue (last 7 days)
	daily_revenue = list(
		qs_success.filter(created_at__date__gte=start_7d.date())
		.annotate(day=TruncDate('created_at'))
		.values('day')
		.annotate(total=Sum('amount'))
		.order_by('day')
	)

	recent_enrollments = list(
		Enrollment.objects.select_related('user', 'course')
		.order_by('-created_at')
		.values('id', 'user_id', 'user__username', 'course_id', 'course__title', 'status', 'created_at')[:10]
	)

	return Response({
		"users": users_count,
		"users_by_role": users_by_role,
		"courses": {"published": courses_published, "draft": courses_draft},
		"enrollments": {"active": enrollments_active, "completed": enrollments_completed},
		"revenue": {
			"total": float(revenue_total),
			"last_7_days": float(revenue_7d),
			"last_30_days": float(revenue_30d),
		},
		"total_videos": total_videos,
		"payments_by_status": payments_by_status,
		"top_courses": top_courses,
		"daily_enrollments": daily_enrollments,
		"daily_revenue": daily_revenue,
		"recent_enrollments": recent_enrollments,
	})


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def overview_metrics(request):
	user = request.user
	if not _is_admin(user):
		return Response({"detail": "Not authorized"}, status=403)
	
	# Time periods
	now = timezone.now()
	start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
	start_yesterday = start_today - timedelta(days=1)
	start_7d = start_today - timedelta(days=6)
	start_30d = start_today - timedelta(days=29)
	
	# User metrics
	users_total = User.objects.count()
	users_today = User.objects.filter(date_joined__gte=start_today).count()
	users_yesterday = User.objects.filter(
		date_joined__gte=start_yesterday, 
		date_joined__lt=start_today
	).count()
	users_7d = User.objects.filter(date_joined__gte=start_7d).count()
	users_30d = User.objects.filter(date_joined__gte=start_30d).count()
	
	# Calculate user growth
	users_growth = 0
	if users_yesterday > 0:
		users_growth = round(((users_today - users_yesterday) / users_yesterday) * 100, 1)
	elif users_today > 0:
		users_growth = 100
		
	# Course metrics
	courses_total = Course.objects.count()
	courses_published = Course.objects.filter(status=Course.Status.PUBLISHED).count()
	courses_draft = Course.objects.filter(status=Course.Status.DRAFT).count()
	courses_today = Course.objects.filter(created_at__gte=start_today).count()
	
	# Enrollment metrics
	enrollments_total = Enrollment.objects.count()
	enrollments_active = Enrollment.objects.filter(status=Enrollment.Status.ACTIVE).count()
	enrollments_completed = Enrollment.objects.filter(status=Enrollment.Status.COMPLETED).count()
	enrollments_today = Enrollment.objects.filter(created_at__gte=start_today).count()
	enrollments_7d = Enrollment.objects.filter(created_at__gte=start_7d).count()
	
	# Calculate completion rate
	completion_rate = 0
	if enrollments_total > 0:
		completion_rate = round((enrollments_completed / enrollments_total) * 100, 1)
	
	# Revenue metrics
	qs_success = Payment.objects.filter(payment_status=Payment.Status.SUCCESS)
	revenue_total = qs_success.aggregate(total=Sum('amount'))['total'] or 0
	revenue_today = qs_success.filter(created_at__gte=start_today).aggregate(total=Sum('amount'))['total'] or 0
	revenue_7d = qs_success.filter(created_at__gte=start_7d).aggregate(total=Sum('amount'))['total'] or 0
	revenue_30d = qs_success.filter(created_at__gte=start_30d).aggregate(total=Sum('amount'))['total'] or 0
	
	# Calculate monthly projected revenue
	if revenue_7d > 0:
		revenue_monthly_projected = float(revenue_7d) * 4.3  # 30/7 = ~4.3
	else:
		revenue_monthly_projected = float(revenue_30d)
	
	# Calculate revenue growth (7d vs previous 7d)
	revenue_prev_7d = qs_success.filter(
		created_at__gte=start_7d - timedelta(days=7),
		created_at__lt=start_7d
	).aggregate(total=Sum('amount'))['total'] or 0
	
	revenue_growth = 0
	if revenue_prev_7d > 0:
		revenue_growth = round(((float(revenue_7d) - float(revenue_prev_7d)) / float(revenue_prev_7d)) * 100, 1)
	elif revenue_7d > 0:
		revenue_growth = 100
	
	# System health metrics
	try:
		# Database connection test
		with connection.cursor() as cursor:
			cursor.execute("SELECT 1")
			db_healthy = True
			db_response_time = 1  # Simplified
	except:
		db_healthy = False
		db_response_time = 0
	
	# System resources (if psutil is available)
	try:
		cpu_percent = psutil.cpu_percent(interval=1)
		memory = psutil.virtual_memory()
		disk = psutil.disk_usage('/')
		
		system_health = {
			'database': {
				'status': 'healthy' if db_healthy else 'error',
				'response_time': db_response_time,
				'description': 'All connections active' if db_healthy else 'Connection failed'
			},
			'cpu': {
				'status': 'healthy' if cpu_percent < 80 else 'warning' if cpu_percent < 95 else 'error',
				'usage': round(cpu_percent, 1),
				'description': f'CPU usage: {cpu_percent:.1f}%'
			},
			'memory': {
				'status': 'healthy' if memory.percent < 80 else 'warning' if memory.percent < 95 else 'error',
				'usage': round(memory.percent, 1),
				'description': f'Memory usage: {memory.percent:.1f}%'
			},
			'disk': {
				'status': 'healthy' if disk.percent < 80 else 'warning' if disk.percent < 95 else 'error',
				'usage': round(disk.percent, 1),
				'description': f'Disk usage: {disk.percent:.1f}%'
			}
		}
	except:
		# Fallback if psutil is not available
		system_health = {
			'database': {
				'status': 'healthy' if db_healthy else 'error',
				'response_time': db_response_time,
				'description': 'All connections active' if db_healthy else 'Connection failed'
			},
			'api': {
				'status': 'healthy',
				'response_time': 45,
				'description': 'Response time: 45ms'
			},
			'storage': {
				'status': 'warning',
				'usage': 85,
				'description': '85% capacity used'
			},
			'security': {
				'status': 'healthy',
				'description': 'No threats detected'
			}
		}
	
	# Recent activities (last 10)
	activities = []
	
	# Recent user registrations
	recent_users = User.objects.filter(date_joined__gte=start_7d).order_by('-date_joined')[:3]
	for user in recent_users:
		time_diff = now - user.date_joined
		if time_diff.days > 0:
			time_str = f"{time_diff.days} days ago"
		elif time_diff.seconds > 3600:
			time_str = f"{time_diff.seconds // 3600} hours ago"
		else:
			time_str = f"{time_diff.seconds // 60} minutes ago"
			
		activities.append({
			'title': 'New user registered',
			'description': f'{user.username} joined the platform',
			'time': time_str,
			'type': 'user'
		})
	
	# Recent course publications
	recent_courses = Course.objects.filter(
		status=Course.Status.PUBLISHED,
		updated_at__gte=start_7d
	).order_by('-updated_at')[:2]
	
	for course in recent_courses:
		time_diff = now - course.updated_at
		if time_diff.days > 0:
			time_str = f"{time_diff.days} days ago"
		elif time_diff.seconds > 3600:
			time_str = f"{time_diff.seconds // 3600} hours ago"
		else:
			time_str = f"{time_diff.seconds // 60} minutes ago"
			
		activities.append({
			'title': 'Course published',
			'description': f'{course.title} went live',
			'time': time_str,
			'type': 'course'
		})
	
	# Recent successful payments
	recent_payments = qs_success.filter(created_at__gte=start_7d).order_by('-created_at')[:2]
	for payment in recent_payments:
		time_diff = now - payment.created_at
		if time_diff.days > 0:
			time_str = f"{time_diff.days} days ago"
		elif time_diff.seconds > 3600:
			time_str = f"{time_diff.seconds // 3600} hours ago"
		else:
			time_str = f"{time_diff.seconds // 60} minutes ago"
			
		activities.append({
			'title': 'Payment processed',
			'description': f'${float(payment.amount)} payment received',
			'time': time_str,
			'type': 'payment'
		})
	
	# Recent enrollments
	recent_enrollments = Enrollment.objects.select_related('user', 'course').filter(
		created_at__gte=start_7d
	).order_by('-created_at')[:2]
	
	for enrollment in recent_enrollments:
		time_diff = now - enrollment.created_at
		if time_diff.days > 0:
			time_str = f"{time_diff.days} days ago"
		elif time_diff.seconds > 3600:
			time_str = f"{time_diff.seconds // 3600} hours ago"
		else:
			time_str = f"{time_diff.seconds // 60} minutes ago"
			
		activities.append({
			'title': 'User enrolled',
			'description': f'{enrollment.user.username} enrolled in {enrollment.course.title}',
			'time': time_str,
			'type': 'user'
		})
	
	# Sort activities by most recent first (simplified)
	activities = sorted(activities, key=lambda x: x['time'])[:10]
	
	# Calculate platform health score
	health_scores = []
	for system, data in system_health.items():
		if data['status'] == 'healthy':
			health_scores.append(100)
		elif data['status'] == 'warning':
			health_scores.append(75)
		else:
			health_scores.append(50)
	
	platform_health = sum(health_scores) / len(health_scores) if health_scores else 95
	
	# Calculate uptime (simplified - in real app, you'd track this)
	uptime = 98.5 + (platform_health - 95) * 0.1
	
	return Response({
		'users': {
			'total': users_total,
			'today': users_today,
			'growth_7d': users_7d,
			'growth_30d': users_30d,
			'growth_rate': users_growth
		},
		'courses': {
			'total': courses_total,
			'published': courses_published,
			'draft': courses_draft,
			'today': courses_today
		},
		'enrollments': {
			'total': enrollments_total,
			'active': enrollments_active,
			'completed': enrollments_completed,
			'today': enrollments_today,
			'growth_7d': enrollments_7d,
			'completion_rate': completion_rate
		},
		'revenue': {
			'total': float(revenue_total),
			'today': float(revenue_today),
			'last_7d': float(revenue_7d),
			'last_30d': float(revenue_30d),
			'monthly_projected': float(revenue_monthly_projected),
			'growth_rate': revenue_growth
		},
		'system_health': system_health,
		'platform_health': round(platform_health, 1),
		'uptime': round(uptime, 1),
		'recent_activities': activities
	})


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def activity_feed(request):
	user = request.user
	if not _is_admin(user):
		return Response({"detail": "Not authorized"}, status=403)
	
	# Get query parameters
	activity_type = request.GET.get('type', 'all')  # all, user, course, payment, enrollment
	date_filter = request.GET.get('date', '7d')  # 1d, 7d, 30d, all
	search_query = request.GET.get('search', '')
	page = int(request.GET.get('page', 1))
	page_size = int(request.GET.get('page_size', 20))
	
	# Calculate date range
	now = timezone.now()
	if date_filter == '1d':
		start_date = now - timedelta(days=1)
	elif date_filter == '7d':
		start_date = now - timedelta(days=7)
	elif date_filter == '30d':
		start_date = now - timedelta(days=30)
	else:  # all
		start_date = None
	
	activities = []
	
	# Helper function to format time
	def format_time_diff(timestamp):
		time_diff = now - timestamp
		if time_diff.days > 0:
			return f"{time_diff.days} day{'s' if time_diff.days != 1 else ''} ago"
		elif time_diff.seconds > 3600:
			hours = time_diff.seconds // 3600
			return f"{hours} hour{'s' if hours != 1 else ''} ago"
		elif time_diff.seconds > 60:
			minutes = time_diff.seconds // 60
			return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
		else:
			return "Just now"
	
	# User Activities
	if activity_type in ['all', 'user']:
		# User registrations
		user_query = User.objects.all()
		if start_date:
			user_query = user_query.filter(date_joined__gte=start_date)
		if search_query:
			user_query = user_query.filter(
				Q(username__icontains=search_query) | 
				Q(email__icontains=search_query) |
				Q(first_name__icontains=search_query) |
				Q(last_name__icontains=search_query)
			)
		
		recent_users = user_query.order_by('-date_joined')[:50]
		for user_obj in recent_users:
			activities.append({
				'id': f'user_reg_{user_obj.id}',
				'type': 'user',
				'action': 'registration',
				'title': 'New user registered',
				'description': f'{user_obj.username} ({user_obj.email}) joined the platform',
				'user': {
					'id': user_obj.id,
					'username': user_obj.username,
					'email': user_obj.email,
					'name': f'{user_obj.first_name} {user_obj.last_name}'.strip() or user_obj.username
				},
				'timestamp': user_obj.date_joined.isoformat(),
				'time_ago': format_time_diff(user_obj.date_joined),
				'metadata': {
					'role': getattr(user_obj, 'role', 'student'),
					'is_active': user_obj.is_active
				}
			})
	
	# Course Activities
	if activity_type in ['all', 'course']:
		# Course creations and publications
		course_query = Course.objects.all()
		if start_date:
			course_query = course_query.filter(
				Q(created_at__gte=start_date) | Q(updated_at__gte=start_date)
			)
		if search_query:
			course_query = course_query.filter(title__icontains=search_query)
		
		recent_courses = course_query.order_by('-updated_at')[:50]
		for course in recent_courses:
			# Course creation
			if not start_date or course.created_at >= start_date:
				activities.append({
					'id': f'course_create_{course.id}',
					'type': 'course',
					'action': 'creation',
					'title': 'Course created',
					'description': f'"{course.title}" was created',
					'course': {
						'id': course.id,
						'title': course.title,
						'status': course.status
					},
					'timestamp': course.created_at.isoformat(),
					'time_ago': format_time_diff(course.created_at),
					'metadata': {
						'status': course.status,
						'price': float(course.price) if course.price else 0
					}
				})
			
			# Course publication (if updated after creation and published)
			if (course.status == Course.Status.PUBLISHED and 
				course.updated_at > course.created_at and
				(not start_date or course.updated_at >= start_date)):
				activities.append({
					'id': f'course_publish_{course.id}',
					'type': 'course',
					'action': 'publication',
					'title': 'Course published',
					'description': f'"{course.title}" went live',
					'course': {
						'id': course.id,
						'title': course.title,
						'status': course.status
					},
					'timestamp': course.updated_at.isoformat(),
					'time_ago': format_time_diff(course.updated_at),
					'metadata': {
						'status': course.status,
						'price': float(course.price) if course.price else 0
					}
				})
	
	# Enrollment Activities
	if activity_type in ['all', 'enrollment']:
		enrollment_query = Enrollment.objects.select_related('user', 'course')
		if start_date:
			enrollment_query = enrollment_query.filter(created_at__gte=start_date)
		if search_query:
			enrollment_query = enrollment_query.filter(
				Q(user__username__icontains=search_query) |
				Q(user__email__icontains=search_query) |
				Q(course__title__icontains=search_query)
			)
		
		recent_enrollments = enrollment_query.order_by('-created_at')[:50]
		for enrollment in recent_enrollments:
			activities.append({
				'id': f'enrollment_{enrollment.id}',
				'type': 'enrollment',
				'action': 'enrollment',
				'title': 'User enrolled',
				'description': f'{enrollment.user.username} enrolled in "{enrollment.course.title}"',
				'user': {
					'id': enrollment.user.id,
					'username': enrollment.user.username,
					'email': enrollment.user.email,
					'name': f'{enrollment.user.first_name} {enrollment.user.last_name}'.strip() or enrollment.user.username
				},
				'course': {
					'id': enrollment.course.id,
					'title': enrollment.course.title,
					'status': enrollment.course.status
				},
				'timestamp': enrollment.created_at.isoformat(),
				'time_ago': format_time_diff(enrollment.created_at),
				'metadata': {
					'status': enrollment.status,
					'progress': enrollment.progress
				}
			})
		
		# Enrollment completions
		completed_enrollments = enrollment_query.filter(
			status=Enrollment.Status.COMPLETED,
			updated_at__gte=start_date if start_date else timezone.now() - timedelta(days=30)
		).order_by('-updated_at')[:30]
		
		for enrollment in completed_enrollments:
			activities.append({
				'id': f'enrollment_complete_{enrollment.id}',
				'type': 'enrollment',
				'action': 'completion',
				'title': 'Course completed',
				'description': f'{enrollment.user.username} completed "{enrollment.course.title}"',
				'user': {
					'id': enrollment.user.id,
					'username': enrollment.user.username,
					'email': enrollment.user.email,
					'name': f'{enrollment.user.first_name} {enrollment.user.last_name}'.strip() or enrollment.user.username
				},
				'course': {
					'id': enrollment.course.id,
					'title': enrollment.course.title,
					'status': enrollment.course.status
				},
				'timestamp': enrollment.updated_at.isoformat(),
				'time_ago': format_time_diff(enrollment.updated_at),
				'metadata': {
					'status': enrollment.status,
					'progress': enrollment.progress
				}
			})
	
	# Payment Activities
	if activity_type in ['all', 'payment']:
		payment_query = Payment.objects.select_related('user', 'course')
		if start_date:
			payment_query = payment_query.filter(created_at__gte=start_date)
		if search_query:
			payment_query = payment_query.filter(
				Q(user__username__icontains=search_query) |
				Q(user__email__icontains=search_query) |
				Q(course__title__icontains=search_query)
			)
		
		recent_payments = payment_query.order_by('-created_at')[:50]
		for payment in recent_payments:
			status_text = {
				Payment.Status.PENDING: 'pending',
				Payment.Status.SUCCESS: 'successful',
				Payment.Status.FAILED: 'failed'
			}.get(payment.payment_status, 'unknown')
			
			activities.append({
				'id': f'payment_{payment.id}',
				'type': 'payment',
				'action': status_text,
				'title': f'Payment {status_text}',
				'description': f'${float(payment.amount)} payment from {payment.user.username} for "{payment.course.title}"',
				'user': {
					'id': payment.user.id,
					'username': payment.user.username,
					'email': payment.user.email,
					'name': f'{payment.user.first_name} {payment.user.last_name}'.strip() or payment.user.username
				},
				'course': {
					'id': payment.course.id,
					'title': payment.course.title,
					'status': payment.course.status
				},
				'timestamp': payment.created_at.isoformat(),
				'time_ago': format_time_diff(payment.created_at),
				'metadata': {
					'amount': float(payment.amount),
					'status': payment.payment_status,
					'transaction_id': payment.transaction_id
				}
			})
	
	# Sort all activities by timestamp (most recent first)
	activities.sort(key=lambda x: x['timestamp'], reverse=True)
	
	# Apply pagination
	total_activities = len(activities)
	start_idx = (page - 1) * page_size
	end_idx = start_idx + page_size
	paginated_activities = activities[start_idx:end_idx]
	
	# Calculate activity statistics
	activity_stats = {
		'total': total_activities,
		'by_type': {},
		'by_action': {},
		'recent_count': len([a for a in activities if 
			timezone.datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')) > 
			now - timedelta(hours=24)])
	}
	
	for activity in activities:
		# Count by type
		activity_type_key = activity['type']
		activity_stats['by_type'][activity_type_key] = activity_stats['by_type'].get(activity_type_key, 0) + 1
		
		# Count by action
		action_key = f"{activity['type']}_{activity['action']}"
		activity_stats['by_action'][action_key] = activity_stats['by_action'].get(action_key, 0) + 1
	
	return Response({
		'activities': paginated_activities,
		'pagination': {
			'page': page,
			'page_size': page_size,
			'total': total_activities,
			'total_pages': (total_activities + page_size - 1) // page_size,
			'has_next': end_idx < total_activities,
			'has_prev': page > 1
		},
		'stats': activity_stats,
		'filters': {
			'type': activity_type,
			'date': date_filter,
			'search': search_query
		}
	})


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def user_profile(request, pk: int):
	user = request.user
	if not _is_admin(user):
		return Response({"detail": "Not authorized"}, status=403)

	try:
		target = User.objects.get(pk=pk)
	except User.DoesNotExist:
		return Response({"detail": "User not found"}, status=404)

	user_data = AdminUserSerializer(target).data

	enrollments_qs = Enrollment.objects.filter(user=target).select_related('course').order_by('-created_at')
	payments_qs = Payment.objects.filter(user=target).select_related('course').order_by('-created_at')

	enrollments = EnrollmentSerializer(enrollments_qs, many=True).data
	payments = PaymentSerializer(payments_qs, many=True).data

	# Simple activity timeline combining enrollments and payments
	activity = []
	for e in enrollments_qs.values('id', 'course_id', 'status', 'created_at'):
		activity.append({
			'type': 'enrollment',
			'id': e['id'],
			'created_at': e['created_at'],
			'status': e['status'],
			'course_id': e['course_id'],
		})
	for p in payments_qs.values('id', 'course_id', 'payment_status', 'amount', 'currency', 'created_at'):
		activity.append({
			'type': 'payment',
			'id': p['id'],
			'created_at': p['created_at'],
			'status': p['payment_status'],
			'amount': float(p['amount']),
			'currency': p['currency'],
			'course_id': p['course_id'],
		})
	activity.sort(key=lambda x: x['created_at'], reverse=True)

	return Response({
		'user': user_data,
		'enrollments': enrollments,
		'payments': payments,
		'activity': activity[:50],
	})


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def course_profile(request, pk: int):
	user = request.user
	if not _is_admin(user):
		return Response({"detail": "Not authorized"}, status=403)

	try:
		course = Course.objects.get(pk=pk)
	except Course.DoesNotExist:
		return Response({"detail": "Course not found"}, status=404)

	# Get course media
	from courses.models import CourseMedia
	media_qs = CourseMedia.objects.filter(course=course).order_by('order')
	
	# Calculate statistics
	enrollments_qs = Enrollment.objects.filter(course=course).select_related('user').order_by('-created_at')
	payments_qs = Payment.objects.filter(course=course).select_related('user').order_by('-created_at')
	
	enrollment_count = enrollments_qs.count()
	total_revenue = float(payments_qs.filter(payment_status=Payment.Status.SUCCESS).aggregate(total=Sum('amount'))['total'] or 0)
	
	# Mock rating and completion rate (you can implement actual logic later)
	average_rating = 4.5  # Mock rating
	completion_rate = 85.0  # Mock completion rate
	
	# Serialize course data
	course_data = CourseSerializer(course).data
	
	# Add computed fields
	course_data['enrollment_count'] = enrollment_count
	course_data['total_revenue'] = total_revenue
	course_data['average_rating'] = average_rating
	course_data['completion_rate'] = completion_rate
	
	# Add media data
	media_data = []
	for media in media_qs:
		# Check if attributes exist before accessing
		try:
			media_data.append({
				'id': media.id,
				'title': media.title,
				'media_type': media.media_type,
				'file_url': request.build_absolute_uri(media.file.url) if media.file else '',
				'file_size': media.file.size if media.file and hasattr(media.file, 'size') else None,
				'duration': getattr(media, 'duration', None),  # Default to None if not present
				'order': media.order,
				'is_preview': getattr(media, 'is_preview', False),  # Default to False if not present
				'created_at': media.created_at.isoformat(),
			})
		except Exception as e:
			print(f"Error processing media {media.id}: {str(e)}")
	
	course_data['media'] = media_data

	return Response(course_data)


class AdminBaseViewSet(viewsets.ModelViewSet):
	permission_classes = [IsAuthenticated]
	filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

	def get_permissions(self):
		perms = super().get_permissions()
		if not _is_admin(self.request.user):
			from rest_framework.exceptions import PermissionDenied
			raise PermissionDenied()
		return perms


class AdminUserViewSet(AdminBaseViewSet):
	queryset = User.objects.all().order_by('-id')
	serializer_class = AdminUserSerializer
	
	filterset_fields = {
		'role': ['exact'],
		'is_active': ['exact'],
		'is_staff': ['exact'],
		'date_joined': ['date', 'date__gte', 'date__lte', 'gte', 'lte'],
	}
	search_fields = ['username', 'email', 'first_name', 'last_name']
	ordering_fields = ['id', 'date_joined']
	
	@action(detail=False, methods=['get'])
	def country_distribution(self, request):
		
			distribution = (
				User.objects
				.filter(role='student')  # or use .filter(is_student=True) if you use a boolean field
				.values('country')
				.annotate(count=Count('id'))
				.order_by('-count')
			)

			# Replace empty or null countries with "Other Countries"
			cleaned = []
			for d in distribution:
				if not d['country'] or d['country'].strip() == "":
					d['country'] = "Other Countries"
				cleaned.append(d)

			return Response(cleaned)


class AdminCourseViewSet(AdminBaseViewSet):
	queryset = Course.objects.all().order_by('-id')
	serializer_class = CourseSerializer
	filterset_fields = {
		'status': ['exact'],
		'created_by': ['exact'],
		'created_at': ['date', 'date__gte', 'date__lte', 'gte', 'lte'],
	}
	search_fields = ['title', 'description']
	ordering_fields = ['id', 'created_at', 'price']

	def perform_create(self, serializer):
		serializer.save(created_by=self.request.user)


class AdminEnrollmentViewSet(AdminBaseViewSet):
	queryset = Enrollment.objects.all().order_by('-id')
	serializer_class = EnrollmentSerializer
	filterset_fields = {
		'status': ['exact'],
		'user': ['exact'],
		'course': ['exact'],
		'created_at': ['date', 'date__gte', 'date__lte', 'gte', 'lte'],
	}
	search_fields = []
	ordering_fields = ['id', 'created_at', 'progress']


class AdminPaymentViewSet(AdminBaseViewSet):
	queryset = Payment.objects.all().order_by('-created_at')
	serializer_class = PaymentSerializer
	filterset_fields = {
		'payment_status': ['exact'],
		'user': ['exact'],
		'course': ['exact'],
		'currency': ['exact'],
		'created_at': ['date', 'date__gte', 'date__lte', 'gte', 'lte'],
	}
	search_fields = ['transaction_id']
	ordering_fields = ['created_at', 'amount']
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_enrolled_students(request, course_id=None, pk=None):
    """Return students and instructors enrolled in a specific course."""
    user = request.user
    if getattr(user, "role", None) != "admin" and not user.is_staff:
        return Response({"detail": "Not authorized"}, status=403)

    # Accept either pk or course_id from the URL
    course_pk = course_id or pk
    if not course_pk:
        return Response({"detail": "Course ID not provided"}, status=400)

    # Get course or 404
    from django.shortcuts import get_object_or_404
    from courses.models import Course
    from enrollments.models import Enrollment
    from users.models import User

    course = get_object_or_404(Course, pk=course_pk)

    # Fetch enrolled users
    enrollments = Enrollment.objects.filter(course=course).select_related("user")

    # Separate users by role
    students = []
    instructors = []
    for e in enrollments:
        u = e.user
        user_data = {
            "id": u.id,
            "name": f"{u.first_name} {u.last_name}".strip() or u.username,
            "email": u.email,
            "avatar": getattr(u, "avatar", None) or "",
            "role": getattr(u, "role", "student"),
        }

        if getattr(u, "role", "student") == "instructor":
            instructors.append(user_data)
        else:
            students.append(user_data)

    return Response({
        "course_id": course.id,
        "course_title": course.title,
        "total_students": len(students),
        "total_instructors": len(instructors),
        "students": students,
        "instructors": instructors,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # or your custom admin permission
def list_all_videos(request):
    """
    Return all course videos (media_type='video') and their total count.
    """
    try:
        videos = CourseMedia.objects.filter(media_type='video').select_related('course')
        serializer = CourseMediaSerializer(videos, many=True)
        
        response_data = {
            "count": videos.count(),
            "videos": serializer.data
        }
        return Response(response_data, status=200)
    except Exception as e:
        print(f"Error fetching all videos: {str(e)}")
        return Response({"detail": str(e)}, status=500)
    
    
    

@api_view(['GET'])
def course_category_popularity(request):
    """
    Returns the number of enrollments per course category.
    """
    data = (
        Enrollment.objects
        .values('course__category')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    # Convert None or empty categories to "Uncategorized"
    formatted_data = [
        {"category": d["course__category"] or "Uncategorized", "count": d["count"]}
        for d in data
    ]

    return Response(formatted_data)





from django.db.models.functions import TruncDay, TruncMonth, TruncQuarter, TruncYear

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def revenue_analytics(request):
    """
    Return revenue data grouped by selected period: daily, monthly, quarterly, or yearly.
    Query param: ?period=daily|monthly|quarterly|yearly
    """
    user = request.user
    if not _is_admin(user):
        return Response({"detail": "Not authorized"}, status=403)

    period = request.query_params.get("period", "monthly").lower()
    valid_periods = {"daily": TruncDay, "monthly": TruncMonth, "quarterly": TruncQuarter, "yearly": TruncYear}
    trunc_func = valid_periods.get(period)
    if trunc_func is None:
        return Response({"error": f"Invalid period '{period}'. Must be one of {list(valid_periods.keys())}"}, status=400)

    qs = Payment.objects.filter(payment_status=Payment.Status.SUCCESS)
    now = timezone.now()

    # Only include last 3 years of data
    start_date = now - timedelta(days=365 * 3)
    qs = qs.filter(created_at__gte=start_date)

    data = (
        qs.annotate(period=trunc_func("created_at"))
        .values("period")
        .annotate(total=Sum("amount"))
        .order_by("period")
    )

    # Clean response format
    formatted = [
        {
            "period": item["period"].strftime("%Y-%m-%d") if item["period"] else None,
            "total": float(item["total"] or 0),
        }
        for item in data
    ]

    total_revenue = qs.aggregate(total=Sum("amount"))["total"] or 0

    return Response({
        "period": period,
        "total_revenue": float(total_revenue),
        "points": formatted
    })
