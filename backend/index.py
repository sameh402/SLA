import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')

# Import WSGI app
from backend.wsgi import application

# Vercel handler
app = application
