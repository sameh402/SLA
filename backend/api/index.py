import os
import sys

# Add the project root to the Python path
path = os.path.dirname(os.path.dirname(__file__))
if path not in sys.path:
    sys.path.insert(0, path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')

from backend.wsgi import application
app = application

