from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates or updates the admin superuser'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = 'drsally@edu.com'
        password = '1234@sally'
        username = 'drsally'

        try:
            # Try to get existing user by email
            user = User.objects.filter(email=email).first()
            
            if user:
                # Update existing user
                user.username = username
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✅ Admin user updated: {email}'))
            else:
                # Create new user
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                self.stdout.write(self.style.SUCCESS(f'✅ Admin user created: {email}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
