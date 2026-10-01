import urllib.request
import json

url = "https://inho-api.orbesystems.com.br/api/v1/auth/login"
payload = json.dumps({
    "email": "admin@orbesystems.com.br",
    "password": "Orbe123!"
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Origin": "https://inho.orbesystems.com.br",
}

req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

with open("login_debug.txt", "w") as f:
    try:
        with urllib.request.urlopen(req) as resp:
            f.write(f"STATUS: {resp.status}\nRESPONSE: {resp.read().decode()}")
    except urllib.error.HTTPError as e:
        f.write(f"STATUS: {e.code}\nRESPONSE: {e.read().decode()}")
    except Exception as e:
        f.write(f"Error: {str(e)}")
