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
        print("🔄 Running startup tasks...")
        
        # Check database connectivity
        from django.db import connections
        from django.db.utils import OperationalError
        db_conn = connections['default']
        try:
            db_conn.cursor()
            print("✅ Database connection successful.")
        except OperationalError as e:
            print(f"❌ Database connection failed: {e}")
            # We continue anyway to let Django show the error page if DEBUG=True
        
        print("🔄 Running migrations...")
        call_command('migrate', interactive=False)
        
        print("🔄 Ensuring admins exist...")
        from users.utils import ensure_admins_exist
        ensure_admins_exist()
        print("✅ Startup tasks completed.")
    except Exception as e:
        import traceback
        print(f"⚠️ Startup task error: {e}")
        print(traceback.format_exc())

    print("🚀 Vercel App Version: 1.0.7 (Enhanced Logging)")
    return application(environ, start_response)
