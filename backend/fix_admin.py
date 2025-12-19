import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
email = 'drsally@edy.com'
password = '1234@sally'

try:
    user = User.objects.get(email=email)
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print(f"Successfully updated user {email} to admin.")
except User.objects.model.DoesNotExist:
    # Try by username if email doesn't work (though user said email)
    user = User.objects.create_superuser(username='drsally', email=email, password=password)
    print(f"Successfully created superuser {email}.")
except Exception as e:
    print(f"Error: {e}")
