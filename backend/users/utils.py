
from django.contrib.auth import get_user_model

def ensure_admins_exist():
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

            # Check if user exists by username or email
            user = User.objects.filter(username=username).first() or User.objects.filter(email=email).first()
            
            if user:
                # Update existing user to ensure they are superuser and have correct role
                user.username = username
                user.email = email
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.role = 'admin'
                # Only set password if it's different or if we want to force it
                # For simplicity and robustness, we'll set it every time for these specific admins
                user.set_password(password)
                user.save()
            else:
                # Create new superuser
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                    role='admin'
                )
        except Exception as e:
            print(f"⚠️ Error ensuring admin {admin_data['username']} exists: {e}")
