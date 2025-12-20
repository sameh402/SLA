from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        import sys
        # Avoid running during migrations or other management commands
        if 'runserver' in sys.argv or 'vercel' in sys.modules:
            try:
                from .utils import ensure_admins_exist
                ensure_admins_exist()
            except Exception:
                pass
