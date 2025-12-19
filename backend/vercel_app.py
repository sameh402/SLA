import os
import sys

# Ensure the current directory is in the path so 'backend' package can be found
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')

from backend.wsgi import application
app = application
