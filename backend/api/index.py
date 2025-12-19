import os
import sys

# Add the project root to the Python path
path = os.path.dirname(os.path.dirname(__file__))
if path not in sys.path:
    sys.path.insert(0, path)

# Set Django settings module before importing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')

# Import Django and setup
import django
django.setup()

# Import WSGI application
from backend.wsgi import application

# Vercel expects 'app' or a handler function
app = application

# Optional: Add a handler function for Vercel
def handler(request, context):
    return app(request, context)
