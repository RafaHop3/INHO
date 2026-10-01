import json, urllib.request

def create():
    data = json.dumps({
        "email": "subagent@inho.com",
        "full_name": "Agente AI",
        "password": "senhaforte123",
        "whatsapp": ""
    }).encode('utf-8')
    req = urllib.request.Request("http://localhost:8000/api/v1/auth/register", data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as f:
            print("Successfully created test admin:", f.read().decode('utf-8'))
    except Exception as e:
        if hasattr(e, 'read'):
            print("Error creating user:", e.read().decode('utf-8'))
        else:
            print("Exception:", e)

if __name__ == "__main__":
    create()
