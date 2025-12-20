import requests
import random
import string

BASE_URL = "http://127.0.0.1:8000"

def test_auto_username():
    print("Testing auto-username generation...")
    email = f"test_{''.join(random.choices(string.ascii_lowercase, k=5))}@example.com"
    payload = {
        "email": email,
        "password": "Password123!",
        "first_name": "Test",
        "last_name": "User",
        "country": "TestCountry",
        "phone": "1234567890",
        "age": 25
    }
    response = requests.post(f"{BASE_URL}/api/users/register/", json=payload)
    if response.status_code == 201:
        print(f"Success! User created with email: {email}")
        # Now check the username in the database (requires admin login)
        return email
    else:
        print(f"Failed to create user: {response.status_code}")
        print(response.json())
        return None

def test_admin_password_hash():
    print("\nTesting admin password hash exposure...")
    # Login as admin
    login_payload = {"username": "drsally@edu.com", "password": "1234@sally"}
    login_res = requests.post(f"{BASE_URL}/api/auth/token/", json=login_payload)
    if login_res.status_code == 200:
        token = login_res.json()['access']
        headers = {"Authorization": f"Bearer {token}"}
        # Get users list
        users_res = requests.get(f"{BASE_URL}/api/admin/users/", headers=headers)
        if users_res.status_code == 200:
            data = users_res.json()
            users = data if isinstance(data, list) else data.get('results', [])
            if len(users) > 0:
                user = users[0]
                if 'password_hash' in user:
                    print(f"Success! password_hash found: {user['password_hash'][:20]}...")
                else:
                    print(f"Failed: password_hash NOT found in user data. Keys: {list(user.keys())}")
            else:
                print("No users found in admin list")
        else:
            print(f"Failed to get users list: {users_res.status_code}")
    else:
        print(f"Failed to login as admin: {login_res.status_code}")

if __name__ == "__main__":
    # Ensure backend is running
    try:
        requests.get(BASE_URL)
        test_auto_username()
        test_admin_password_hash()
    except requests.exceptions.ConnectionError:
        print(f"Error: Backend is not running at {BASE_URL}")
