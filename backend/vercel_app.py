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
    # Run migrations and ensure admins exist
    try:
        print("🔄 Running migrations and admin setup...")
        call_command('migrate', interactive=False)
        
        from users.utils import ensure_admins_exist
        ensure_admins_exist()
        print("✅ Startup tasks completed.")
    except Exception as e:
        print(f"⚠️ Startup task error: {e}")

    print("🚀 Vercel App Version: 1.0.6 (Soft Admin Fix)")
    return application(environ, start_response)
