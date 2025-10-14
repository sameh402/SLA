"""
Simple script to create sample data for testing
Run this in Django shell: exec(open('create_sample_data.py').read())
"""

from django.contrib.auth import get_user_model
from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Payment
from decimal import Decimal
import random

User = get_user_model()

# Create admin user
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@sallylms.com',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"Created admin: {admin_user.username}")

# Create instructor
instructor, created = User.objects.get_or_create(
    username='instructor',
    defaults={
        'email': 'instructor@sallylms.com',
        'first_name': 'John',
        'last_name': 'Instructor',
        'role': 'instructor'
    }
)
if created:
    instructor.set_password('instructor123')
    instructor.save()
    print(f"Created instructor: {instructor.username}")

# Create some students
students = []
for i in range(5):
    student, created = User.objects.get_or_create(
        username=f'student{i+1}',
        defaults={
            'email': f'student{i+1}@example.com',
            'first_name': f'Student{i+1}',
            'last_name': 'User',
            'role': 'student'
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        print(f"Created student: {student.username}")
    students.append(student)

# Create courses
courses = []
course_data = [
    {'title': 'Python Programming', 'description': 'Learn Python basics', 'price': Decimal('99.99')},
    {'title': 'Web Development', 'description': 'Build web apps', 'price': Decimal('149.99')},
    {'title': 'Data Science', 'description': 'Analyze data', 'price': Decimal('199.99')}
]

for data in course_data:
    course, created = Course.objects.get_or_create(
        title=data['title'],
        defaults={
            'description': data['description'],
            'price': data['price'],
            'status': 'published',
            'created_by': instructor
        }
    )
    if created:
        print(f"Created course: {course.title}")
    courses.append(course)

# Create enrollments
for i, student in enumerate(students):
    for j, course in enumerate(courses[:2]):  # Each student in 2 courses
        enrollment, created = Enrollment.objects.get_or_create(
            user=student,
            course=course,
            defaults={
                'status': random.choice(['active', 'completed']),
                'progress': random.randint(20, 100)
            }
        )
        if created:
            print(f"Created enrollment: {student.username} -> {course.title}")

# Create payments
enrollments = Enrollment.objects.all()
for enrollment in enrollments:
    if random.random() < 0.8:  # 80% chance of payment
        payment, created = Payment.objects.get_or_create(
            user=enrollment.user,
            course=enrollment.course,
            defaults={
                'amount': enrollment.course.price,
                'currency': 'USD',
                'payment_status': random.choice(['success', 'pending', 'failed']),
                'transaction_id': f'txn_{random.randint(100000, 999999)}'
            }
        )
        if created:
            print(f"Created payment: {enrollment.user.username} -> {enrollment.course.title}")

print("\n=== Summary ===")
print(f"Users: {User.objects.count()}")
print(f"Courses: {Course.objects.count()}")
print(f"Enrollments: {Enrollment.objects.count()}")
print(f"Payments: {Payment.objects.count()}")
print("Sample data created!")

