import asyncio
from playwright.async_api import async_playwright
import os

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print("Navigating to INHO Login...")
        await page.goto("https://inho.orbesystems.com.br/login")
        
        print("Typing credentials for Rafael...")
        await page.fill('input[type="email"]', "rafael@orbesystems.com.br")
        await page.fill('input[type="password"]', "Muhammadalivsroyjonesjr#Ju.130798")
        
        print("Clicking login...")
        await page.click('button:has-text("Entrar na plataforma")')
        
        print("Waiting for dashboard redirect...")
        try:
            await page.wait_for_url("**/dashboard**", timeout=15000)
            print(f"Success! Arrived at {page.url}")
        except Exception as e:
            print(f"Failed to redirect: {e}")
            await page.screenshot(path="login_failure.png")
            await browser.close()
            return
            
        await page.screenshot(path="C:\\Users\\rafae\\.gemini\\antigravity\\brain\\9c250dd1-7e4a-49f6-b77c-8de7e356b24c\\rafael_dashboard_playwright.png")
        
        # Look for the user name in the sidebar (usually in a p tag or span at the bottom)
        print("Checking sidebar text...")
        sidebar_text = await page.evaluate('''() => {
            const sidebar = document.querySelector('nav');
            return sidebar ? sidebar.innerText : 'Sidebar not found';
        }''')
        
        print("--- SIDEBAR TEXT ---")
        print(sidebar_text)
        print("--------------------")
        
        # Test WhatsApp bot section
        print("Searching for WhatsApp / CRM section to message Juliana...")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
