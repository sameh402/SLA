import os
import sys
import django

# Ensure the current directory is in the path so 'backend' package can be found
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')
django.setup()

# --- Auto-setup Admin ---
from django.contrib.auth import get_user_model
User = get_user_model()
email = 'drsally@edu.com'
password = '1234@sally'

try:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(username='drsally', email=email, password=password)
        print(f"Admin {email} created successfully.")
    else:
        user = User.objects.get(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        print(f"Admin {email} updated successfully.")
except Exception as e:
    print(f"Error ensuring admin exists: {e}")
# ------------------------

from backend.wsgi import application
app = application
