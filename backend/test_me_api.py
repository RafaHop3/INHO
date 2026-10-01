import httpx
import sys

def test_login_and_me():
    url_login = "https://inho-api.orbesystems.com.br/api/v1/auth/login"
    url_me = "https://inho-api.orbesystems.com.br/api/v1/users/me"
    payload = {
        "email": "rafael@orbesystems.com.br",
        "password": "Muhammadalivsroyjonesjr#Ju.130798"
    }
    
    print(f"Testing login...")
    try:
        r = httpx.post(url_login, json=payload, timeout=10.0)
        token_data = r.json()
        print(f"Login Status: {r.status_code}")
        
        access_token = token_data.get("access_token")
        if access_token:
            print("Fetching /users/me...")
            headers = {"Authorization": f"Bearer {access_token}"}
            r_me = httpx.get(url_me, headers=headers, timeout=10.0)
            print(f"Me Status Code: {r_me.status_code}")
            print(f"Me Response: {r_me.text}")
        else:
            print("No access token!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_and_me()
