import urllib.request
import json
import urllib.error

payload = json.dumps({
    "email": "admin@orbesystems.com.br",
    "password": "Orbe123!"
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
}

for port in [8000, 8001]:
    url = f"http://52.20.22.241:{port}/api/v1/auth/login"
    print(f"--- PORT {port} ---")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print("STATUS:", resp.status)
            print("RESPONSE:", resp.read().decode())
    except urllib.error.HTTPError as e:
        print("STATUS:", e.code)
        print("RESPONSE:", e.read().decode())
    except Exception as e:
        print("Error:", str(e))
