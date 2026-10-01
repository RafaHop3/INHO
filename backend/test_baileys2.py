import urllib.request
import json
import urllib.error

url = "http://52.20.22.241:3333/message/sendText/Orber"
payload = json.dumps({
    "number": "5551984743957",
    "options": {"delay": 1200},
    "textMessage": {"text": "Aquele Teste 3333"}
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
    "apikey": "B6D711FCDE4D4FD5936544120E713976"
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
