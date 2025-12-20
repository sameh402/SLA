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
username = 'drsally'

try:
    # Try to find user by email first
    user = User.objects.filter(email=email).first()
    if not user:
        # If not found by email, try by username
        user = User.objects.filter(username=username).first()
    
    if not user:
        # Create new if doesn't exist at all
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"✅ Admin {email} created successfully.")
    else:
        # Update existing user to be the admin we want
        user.email = email
        user.username = username
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()
        print(f"✅ Admin {email} updated successfully.")
except Exception as e:
    print(f"❌ Error ensuring admin exists: {e}")
# ------------------------

from backend.wsgi import application
app = application
