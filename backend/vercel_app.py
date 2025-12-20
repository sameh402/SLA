import os
import sys
import django
from django.core.management import call_command

# Ensure the current directory is in the path
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')
django.setup()

from backend.wsgi import application

# Wrapper to ensure migrations run on cold start
def app(environ, start_response):
    # Check for a special header or path to trigger admin setup safely
    # Or just run it once if we can detect cold start
    
    # For now, let's try to run it but catch errors so we don't crash the whole app
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Only try to create if it doesn't exist to save time
        if not User.objects.filter(email='drsally@edu.com').exists():
            print("🔄 Running migrations and admin setup...")
            call_command('migrate')
            
            email = 'drsally@edu.com'
            password = '1234@sally'
            username = 'drsally'
            
            user = User.objects.filter(username=username).first()
            if not user:
                User.objects.create_superuser(username=username, email=email, password=password)
                print(f"✅ Admin {email} created.")
            else:
                user.email = email
                user.is_staff = True
                user.is_superuser = True
                user.set_password(password)
                user.save()
                print(f"✅ Admin {email} updated.")
    except Exception as e:
        print(f"⚠️ Startup task error: {e}")

    print("🚀 Vercel App Version: 1.0.5 (Admin Fix)")
    return application(environ, start_response)
