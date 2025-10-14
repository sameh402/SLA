from django.utils import timezone
from datetime import timedelta
import random
from django.contrib.auth import get_user_model
from courses.models import Course
from payments.models import Payment

User = get_user_model()


def run():
    """
    Populate Payment data for testing.
    Creates payments with success status across different months and years.
    Run using:
        python manage.py runscript populate_payments
    """

    print("🧾 Starting payment population...")

    # ✅ Get some existing users and courses
    users = list(User.objects.all()[:5])
    courses = list(Course.objects.all()[:5])

    if not users or not courses:
        print("⚠️ Need at least 1 user and 1 course to create payments.")
        return

    Payment.objects.all().delete()  # optional — clear old test data

    now = timezone.now()
    base_date = now.replace(day=1, hour=12, minute=0, second=0, microsecond=0)

    total_created = 0

    for year_offset in range(0, 3):  # last 3 years
        for month_offset in range(1, 13):  # 12 months
            payment_date = base_date - timedelta(days=30 * (12 * year_offset + month_offset))

            for _ in range(random.randint(2, 5)):  # random payments per month
                user = random.choice(users)
                course = random.choice(courses)
                amount = round(random.uniform(100, 1000), 2)
                status = random.choice(
                    [Payment.Status.SUCCESS, Payment.Status.PENDING, Payment.Status.FAILED]
                )

                p = Payment.objects.create(
                    user=user,
                    course=course,
                    amount=amount,
                    currency="EGP",
                    payment_status=status,
                    transaction_id=f"TXN-{random.randint(100000,999999)}",
                    created_at=payment_date,
                )

                total_created += 1

    print(f"✅ Done. Created {total_created} payments for different dates.")
