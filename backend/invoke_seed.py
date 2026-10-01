import urllib.request
import urllib.error

url = "https://s65ofps3ve.execute-api.us-east-1.amazonaws.com/api/v1/admin/seed"

req = urllib.request.Request(url, method="GET")

try:
    with urllib.request.urlopen(req) as resp:
        print("STATUS:", resp.status)
        print("RESPONSE:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("RESPONSE:", e.read().decode())
except Exception as e:
    print("Error:", str(e))
