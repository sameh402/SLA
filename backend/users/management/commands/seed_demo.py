import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Payment
from certificates.models import Certificate


class Command(BaseCommand):
	helps = 'Populate demo users, courses, enrollments, payments, and certificates.'

	def handle(self, *args, **options):
		User = get_user_model()
		# Admin
		admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com', 'role': 'admin', 'is_staff': True, 'is_superuser': True})
		if not admin.has_usable_password():
			admin.set_password('admin123')
			admin.save()
		# Instructor
		instructor, _ = User.objects.get_or_create(username='instructor', defaults={'email': 'instructor@example.com', 'role': 'instructor'})
		if not instructor.has_usable_password():
			instructor.set_password('instructor123')
			instructor.save()
		# Student
		student, _ = User.objects.get_or_create(username='student', defaults={'email': 'student@example.com', 'role': 'student'})
		if not student.has_usable_password():
			student.set_password('student123')
			student.save()

		# Courses
		c1, _ = Course.objects.get_or_create(title='Python 101', defaults={'description': 'Intro to Python', 'status': Course.Status.PUBLISHED, 'price': 0, 'created_by': instructor})
		c2, _ = Course.objects.get_or_create(title='Django REST', defaults={'description': 'APIs with DRF', 'status': Course.Status.PUBLISHED, 'price': 49.99, 'created_by': instructor})
		c3, _ = Course.objects.get_or_create(title='Draft Course', defaults={'description': 'Not visible publicly', 'status': Course.Status.DRAFT, 'price': 19.99, 'created_by': instructor})

		# Enrollments
		e1, _ = Enrollment.objects.get_or_create(user=student, course=c1, defaults={'status': Enrollment.Status.COMPLETED, 'progress': 100})
		e2, _ = Enrollment.objects.get_or_create(user=student, course=c2, defaults={'status': Enrollment.Status.ACTIVE, 'progress': 30})

		# Payments
		p1, _ = Payment.objects.get_or_create(user=student, course=c2, defaults={'amount': c2.price, 'currency': 'USD', 'payment_status': Payment.Status.SUCCESS, 'transaction_id': uuid.uuid4().hex})

		# Certificates for completed
		if e1.status == Enrollment.Status.COMPLETED:
			Certificate.objects.get_or_create(user=student, course=c1, defaults={'certificate_url': f'/media/certificates/{student.id}-{c1.id}.pdf'})

		self.stdout.write(self.style.SUCCESS('Demo data ready: admin/admin123, instructor/instructor123, student/student123'))

