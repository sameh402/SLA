# #!/usr/bin/env python
# """
# Populate test data for LMS
# """
# import os
# import sys
# import django
# from datetime import datetime, timedelta
# from decimal import Decimal
# import random

# # Setup Django
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
# django.setup()

# from users.models import User
# from courses.models import Course
# from enrollments.models import Enrollment
# from payments.models import Payment

# def create_test_data():
#     print("Creating test data...")
    
#     # Create test users
#     print("Creating users...")
#     admin_user, created = User.objects.get_or_create(
#         username='admin',
#         defaults={
#             'email': 'admin@sallylms.com',
#             'first_name': 'Admin',
#             'last_name': 'User',
#             'role': 'admin',
#             'is_staff': True,
#             'is_superuser': True
#         }
#     )
#     if created:
#         admin_user.set_password('admin123')
#         admin_user.save()
#         print(f"Created admin user: {admin_user.username}")
    
#     # Create instructor
#     instructor, created = User.objects.get_or_create(
#         username='instructor1',
#         defaults={
#             'email': 'instructor@sallylms.com',
#             'first_name': 'John',
#             'last_name': 'Instructor',
#             'role': 'instructor'
#         }
#     )
#     if created:
#         instructor.set_password('instructor123')
#         instructor.save()
#         print(f"Created instructor: {instructor.username}")
    
#     # Create students
#     students = []
#     student_names = [
#         ('Alice', 'Johnson'), ('Bob', 'Smith'), ('Charlie', 'Brown'),
#         ('Diana', 'Wilson'), ('Eve', 'Davis'), ('Frank', 'Miller'),
#         ('Grace', 'Taylor'), ('Henry', 'Anderson'), ('Ivy', 'Thomas'),
#         ('Jack', 'Jackson')
#     ]
    
#     for i, (first_name, last_name) in enumerate(student_names):
#         student, created = User.objects.get_or_create(
#             username=f'student{i+1}',
#             defaults={
#                 'email': f'student{i+1}@example.com',
#                 'first_name': first_name,
#                 'last_name': last_name,
#                 'role': 'student'
#             }
#         )
#         if created:
#             student.set_password('student123')
#             student.save()
#             print(f"Created student: {student.username}")
#         students.append(student)
    
#     # Create courses
#     print("Creating courses...")
#     course_data = [
#         {
#             'title': 'Introduction to Python Programming',
#             'description': 'Learn the fundamentals of Python programming language.',
#             'price': Decimal('99.99'),
#             'status': Course.Status.PUBLISHED
#         },
#         {
#             'title': 'Web Development with Django',
#             'description': 'Build web applications using Django framework.',
#             'price': Decimal('149.99'),
#             'status': Course.Status.PUBLISHED
#         },
#         {
#             'title': 'React.js for Beginners',
#             'description': 'Learn React.js to build modern web applications.',
#             'price': Decimal('129.99'),
#             'status': Course.Status.PUBLISHED
#         },
#         {
#             'title': 'Data Science with Python',
#             'description': 'Analyze data and build machine learning models.',
#             'price': Decimal('199.99'),
#             'status': Course.Status.DRAFT
#         },
#         {
#             'title': 'Mobile App Development',
#             'description': 'Build mobile apps for iOS and Android.',
#             'price': Decimal('179.99'),
#             'status': Course.Status.PUBLISHED
#         }
#     ]
    
#     courses = []
#     for course_info in course_data:
#         course, created = Course.objects.get_or_create(
#             title=course_info['title'],
#             defaults={
#                 **course_info,
#                 'created_by': instructor
#             }
#         )
#         if created:
#             print(f"Created course: {course.title}")
#         courses.append(course)
    
#     # Create enrollments
#     print("Creating enrollments...")
#     enrollment_statuses = [
#         Enrollment.Status.ACTIVE,
#         Enrollment.Status.COMPLETED,
#         Enrollment.Status.ACTIVE,
#         Enrollment.Status.ACTIVE,
#         Enrollment.Status.COMPLETED
#     ]
    
#     for i, student in enumerate(students):
#         # Each student enrolls in 2-4 random courses
#         num_courses = random.randint(2, 4)
#         student_courses = random.sample(courses[:4], num_courses)  # Only published courses
        
#         for j, course in enumerate(student_courses):
#             enrollment, created = Enrollment.objects.get_or_create(
#                 user=student,
#                 course=course,
#                 defaults={
#                     'status': random.choice(enrollment_statuses),
#                     'progress': random.randint(10, 100),
#                     'created_at': datetime.now() - timedelta(days=random.randint(1, 30))
#                 }
#             )
#             if created:
#                 print(f"Created enrollment: {student.username} -> {course.title}")
    
#     # Create payments
#     print("Creating payments...")
#     payment_statuses = [
#         Payment.Status.SUCCESS,
#         Payment.Status.SUCCESS,
#         Payment.Status.SUCCESS,
#         Payment.Status.PENDING,
#         Payment.Status.FAILED
#     ]
    
#     enrollments = Enrollment.objects.all()
#     for enrollment in enrollments:
#         # 80% chance of having a payment for each enrollment
#         if random.random() < 0.8:
#             payment, created = Payment.objects.get_or_create(
#                 user=enrollment.user,
#                 course=enrollment.course,
#                 defaults={
#                     'amount': enrollment.course.price,
#                     'currency': 'USD',
#                     'payment_status': random.choice(payment_statuses),
#                     'transaction_id': f'txn_{random.randint(100000, 999999)}',
#                     'created_at': enrollment.created_at + timedelta(minutes=random.randint(1, 60))
#                 }
#             )
#             if created:
#                 print(f"Created payment: {enrollment.user.username} -> {enrollment.course.title} (${payment.amount})")
    
#     # Print summary
#     print("\n=== Data Summary ===")
#     print(f"Users: {User.objects.count()}")
#     print(f"Courses: {Course.objects.count()}")
#     print(f"Enrollments: {Enrollment.objects.count()}")
#     print(f"Payments: {Payment.objects.count()}")
#     print("\nTest data created successfully!")

# if __name__ == '__main__':
#     create_test_data()


from payments.models import Payment
from courses.models import Course
from users.models import User
from django.utils import timezone
from datetime import timedelta
import uuid
from decimal import Decimal

# ✅ Get or create test user and course
user, _ = User.objects.get_or_create(username="testuser", defaults={"email": "test@example.com"})
course, _ = Course.objects.get_or_create(title="Python Basics", defaults={"status": "published"})

# ✅ Define 3 different timestamps: today, 1 month ago, and 1 year ago
now = timezone.now()
dates = [
    now - timedelta(days=5),       # 5 days ago
    now - timedelta(days=40),      # ~1 month ago
    now - timedelta(days=370),     # ~1 year ago
]

# ✅ Create 3 payments
payments = [
    Payment.objects.create(
        user=user,
        course=course,
        amount=Decimal("49.99"),
        currency="EGP",
        payment_status=Payment.Status.SUCCESS,
        transaction_id=str(uuid.uuid4()),
        created_at=dates[0],
    ),
    Payment.objects.create(
        user=user,
        course=course,
        amount=Decimal("75.50"),
        currency="EGP",
        payment_status=Payment.Status.SUCCESS,
        transaction_id=str(uuid.uuid4()),
        created_at=dates[1],
    ),
    Payment.objects.create(
        user=user,
        course=course,
        amount=Decimal("120.00"),
        currency="EGP",
        payment_status=Payment.Status.SUCCESS,
        transaction_id=str(uuid.uuid4()),
        created_at=dates[2],
    ),
]

print("✅ Created test payments:")
for p in payments:
    print(f" - {p.transaction_id} | {p.amount} {p.currency} | {p.created_at.strftime('%Y-%m-%d')} | {p.payment_status}")

