import urllib.request
import json
import urllib.error

url = "http://52.20.22.241:3001/send"
payload = json.dumps({
    "phone": "5551984743957",
    "message": "Orbrick>Inho>Pedro = Teste final completo! Conexao reestabelecida e webhook 100% online na INHO. =)"
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
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
