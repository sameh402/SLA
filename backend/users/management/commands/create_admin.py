from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates or updates the admin superuser'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        admins = [
            {
                'username': 'drsally',
                'email': 'drsally@edu.com',
                'password': '1234@sally'
            },
            {
                'username': 'sameh',
                'email': 'sameh@edu.com',
                'password': '4321@sameh'
            }
        ]

        for admin_data in admins:
            try:
                username = admin_data['username']
                email = admin_data['email']
                password = admin_data['password']

                # Try to get existing user by username or email
                user = User.objects.filter(username=username).first() or User.objects.filter(email=email).first()
                
                if user:
                    # Update existing user
                    user.username = username
                    user.email = email
                    user.is_staff = True
                    user.is_superuser = True
                    user.is_active = True
                    user.role = 'admin'
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'✅ Admin user updated: {username}'))
                else:
                    # Create new user
                    user = User.objects.create_superuser(
                        username=username,
                        email=email,
                        password=password,
                        role='admin'
                    )
                    self.stdout.write(self.style.SUCCESS(f'✅ Admin user created: {username}'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error creating/updating {admin_data["username"]}: {str(e)}'))
