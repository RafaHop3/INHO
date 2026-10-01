import urllib.request
import json
import urllib.error

url = "https://s65ofps3ve.execute-api.us-east-1.amazonaws.com/api/v1/auth/login"
payload = json.dumps({
    "email": "pedro@orbesystems.com.br",
    "password": "Orbe123!"
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
}

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
