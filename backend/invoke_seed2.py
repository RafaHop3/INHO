import urllib.request
import json
import urllib.error

url = "https://s65ofps3ve.execute-api.us-east-1.amazonaws.com/api/v1/admin/seed"

req = urllib.request.Request(url, method="GET")

with open("seed_debug.txt", "w") as f:
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode()
            try:
                js = json.loads(data)
                f.write(js.get("trace", data))
            except:
                f.write(data)
    except urllib.error.HTTPError as e:
        f.write(f"HTTP {e.code}\n{e.read().decode()}")
    except Exception as e:
        f.write(str(e))
