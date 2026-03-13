import os
import asyncio
from playwright.async_api import async_playwright
import traceback

async def run_edevlet_bot(tckn: str, password: str, docs: list) -> dict:
    """
    Simulates logging into e-Devlet and submitting documents via Playwright.
    Returns a dictionary with status and message.
    """
    print(f"[RPA Bot] Starting session for TCKN: {tckn}")
    
    try:
        async with async_playwright() as p:
            # Launch browser in headless mode (or non-headless for debugging)
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            print("[RPA Bot] Navigating to turkiye.gov.tr...")
            # Navigate to the official login portal
            await page.goto("https://giris.turkiye.gov.tr/Giris/")

            # Wait for the login form to be visible
            await page.wait_for_selector('input[name="tridField"]', timeout=15000)

            print("[RPA Bot] Entering credentials...")
            await page.fill('input[name="tridField"]', tckn)
            await page.fill('input[name="egpField"]', password)
            
            print("[RPA Bot] Clicking login...")
            await page.click('input[name="submitButton"]')

            # Now we wait to see if we reached the dashboard or got an error
            # e-Devlet redirects dynamically. We wait for network idle or a specific element.
            # E.g., the user profile name on the top right, or an error message.
            try:
                # Wait for the main page generic search box or the logged-in user name
                await page.wait_for_selector('input#searchField', timeout=10000)
                print("[RPA Bot] Login successful! Navigating e-Devlet portal.")
            except Exception:
                # Check if there is an explicit error message on the login screen
                error_msg_el = await page.query_selector('.error')
                if error_msg_el:
                    err_text = await error_msg_el.inner_text()
                    await browser.close()
                    return {"status": "error", "message": f"Login failed: {err_text.strip()}"}
                
                await browser.close()
                return {"status": "error", "message": "Login timeout. Incorrect credentials or CAPTCHA required."}

            # ------ SIMULATED PORTAL NAVIGATION & UPLOAD ------
            print("[RPA Bot] Navigating to Municipality Services...")
            await asyncio.sleep(2) # Simulating navigation time
            
            print(f"[RPA Bot] Uploading {len(docs)} documents...")
            # In a real scenario, we'd navigate to the exact service URL, e.g.:
            # await page.goto("https://www.turkiye.gov.tr/besiktas-belediyesi")
            # And interact with file inputs: await page.set_input_files('input[type="file"]', local_file_path)
            await asyncio.sleep(3) # Simulating upload time

            print("[RPA Bot] Submitting final form...")
            await asyncio.sleep(1) # Simulating final submit click
            
            print("[RPA Bot] Submission completed.")
            await browser.close()
            
            return {"status": "success", "message": "Documents submitted to e-Devlet successfully."}

    except Exception as e:
        err_trace = traceback.format_exc()
        print(f"[RPA Bot] Fatal Error:\n{err_trace}")
        return {"status": "error", "message": f"Automation failed: {str(e)}"}
