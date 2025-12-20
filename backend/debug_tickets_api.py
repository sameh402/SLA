
import urllib.request
import json

def test_tickets():
    url = "http://127.0.0.1:8000/api/support/tickets/"
    # We need a token. Let's try to login as sameh.
    login_url = "http://127.0.0.1:8000/api/auth/token/"
    login_data = json.dumps({"username": "sameh", "password": "4321@sameh"}).encode('utf-8')
    
    req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            access_token = res_data['access']
            print("✅ Login successful")
            
            # Now fetch tickets
            req = urllib.request.Request(url, headers={'Authorization': f'Bearer {access_token}'})
            with urllib.request.urlopen(req) as response:
                tickets_data = json.loads(response.read().decode())
                print("✅ Tickets fetched")
                print(f"Response type: {type(tickets_data)}")
                if isinstance(tickets_data, dict):
                    print(f"Keys: {tickets_data.keys()}")
                    if 'results' in tickets_data:
                        print(f"Results count: {len(tickets_data['results'])}")
                elif isinstance(tickets_data, list):
                    print(f"List length: {len(tickets_data)}")
                
                print("Full response snippet:", json.dumps(tickets_data, indent=2)[:500])
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_tickets()
