# Quick data creation - paste this in Django shell
from django.contrib.auth import get_user_model
from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Payment
from decimal import Decimal

User = get_user_model()

# Create admin if not exists
admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@test.com', 'role': 'admin', 'is_staff': True})
admin.set_password('admin123')
admin.save()

# Create instructor
instructor, _ = User.objects.get_or_create(username='instructor1', defaults={'email': 'inst@test.com', 'role': 'instructor'})

# Create course
course, _ = Course.objects.get_or_create(title='Test Course', defaults={'description': 'Test', 'price': Decimal('99.99'), 'status': 'published', 'created_by': instructor})

# Create student
student, _ = User.objects.get_or_create(username='student1', defaults={'email': 'student@test.com', 'role': 'student'})

# Create enrollment
enrollment, _ = Enrollment.objects.get_or_create(user=student, course=course, defaults={'status': 'active', 'progress': 75})

# Create payment
payment, _ = Payment.objects.get_or_create(user=student, course=course, defaults={'amount': course.price, 'payment_status': 'success', 'transaction_id': 'test123'})

print("Sample data created!")
print(f"Users: {User.objects.count()}")
print(f"Courses: {Course.objects.count()}")
print(f"Enrollments: {Enrollment.objects.count()}")
print(f"Payments: {Payment.objects.count()}")

