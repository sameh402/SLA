from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course


class Command(BaseCommand):
	helps = 'Seed LMS with an instructor user and a sample published course.'

	def handle(self, *args, **options):
		User = get_user_model()
		# Ensure admin has a password
		admin, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com', 'role': 'admin'})
		if created or not admin.has_usable_password():
			admin.set_password('admin123')
			admin.is_staff = True
			admin.is_superuser = True
			admin.save()
			self.stdout.write(self.style.SUCCESS('Admin user ready (admin/admin123)'))

		# Create instructor
		instructor, created = User.objects.get_or_create(username='instructor', defaults={'email': 'instructor@example.com', 'role': 'instructor'})
		if created or not instructor.has_usable_password():
			instructor.set_password('instructor123')
			instructor.save()
			self.stdout.write(self.style.SUCCESS('Instructor user ready (instructor/instructor123)'))

		# Sample course
		course, created = Course.objects.get_or_create(
			title='Sample Course',
			defaults={
				'description': 'A sample published course',
				'status': Course.Status.PUBLISHED,
				'price': 0,
				'created_by': instructor,
			}
		)
		if created:
			self.stdout.write(self.style.SUCCESS(f'Created course #{course.id}: {course.title}'))
		else:
			self.stdout.write(self.style.WARNING('Sample course already exists'))

		self.stdout.write(self.style.SUCCESS('Seeding complete'))

