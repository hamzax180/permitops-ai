import os
import asyncio
from playwright.async_api import async_playwright
import traceback

async def run_mersis_bot(tckn: str, password: str, portal_url: str) -> dict:
    """
    Detailed login sequence for MERSİS portal.
    """
    print(f"[MERSİS Bot] Starting session for TCKN: {tckn}")
    
    try:
        p = await async_playwright().start()
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context()
        page = await context.new_page()

        print(f"[MERSİS Bot] Navigating to: {portal_url}")
        await page.goto(portal_url)
        
        print("[MERSİS Bot] Clicking 'Login via e-Government'...")
        await page.click('text="Login via e-Government"', timeout=20000)
        
        # Wait for redirect to e-Devlet
        await page.wait_for_selector('input[name="tridField"]', timeout=30000)

        print("[MERSİS Bot] Typing TCKN character by character...")
        await page.type('input[name="tridField"]', tckn, delay=400)
        
        print("[MERSİS Bot] Typing Password character by character...")
        await page.type('input[name="egpField"]', password, delay=400)
        
        print("[MERSİS Bot] Clicking Log in...")
        submit_btn = await page.query_selector('input[name="submitButton"], .submitButton, button[type="submit"]')
        if submit_btn:
            await submit_btn.click()

        print("[MERSİS Bot] Waiting for MERSİS Dashboard...")
        try:
            await page.wait_for_url("**/Portal/Home**", timeout=120000)
            print("[MERSİS Bot] Dashboard detected!")
        except Exception:
            if "mersis" in page.url and "Giris" not in page.url:
                 print("[MERSİS Bot] Dashboard seems loaded via URL. Proceeding...")
            else:
                return {"status": "error", "message": "Login timeout. MERSİS Dashboard not reached."}

        return {"status": "success", "message": "Logged into MERSİS successfully. Browser is yours!"}

    except Exception as e:
        err_trace = traceback.format_exc()
        print(f"[MERSİS Bot] Fatal Error:\n{err_trace}")
        return {"status": "error", "message": f"MERSİS Automation failed: {str(e)}"}

async def run_edevlet_bot(tckn: str, password: str, docs: list) -> dict:
    """
    Simulates logging into e-Devlet and submitting documents (Step 12).
    """
    print(f"[e-Devlet Bot] Starting session for TCKN: {tckn}")
    
    try:
        p = await async_playwright().start()
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context()
        page = await context.new_page()

        print("[e-Devlet Bot] Navigating to turkiye.gov.tr...")
        await page.goto("https://giris.turkiye.gov.tr/Giris/")

        await page.wait_for_selector('input[name="tridField"]', timeout=30000)

        print("[e-Devlet Bot] Typing TCKN character by character...")
        await page.type('input[name="tridField"]', tckn, delay=400)
        
        print("[e-Devlet Bot] Typing Password character by character...")
        await page.type('input[name="egpField"]', password, delay=400)
        
        try:
            dashboard_el = await page.query_selector('input#searchField')
            if not dashboard_el:
                print("[e-Devlet Bot] Clicking Giris Yap...")
                await page.click('input[name="submitButton"]', timeout=10000)
            else:
                print("[e-Devlet Bot] Already on dashboard. Skipping login click.")
        except Exception:
            print("[e-Devlet Bot] Login button not found or already logged in.")

        print("[e-Devlet Bot] Waiting for dashboard activation...")
        try:
            await page.wait_for_selector('input#searchField', timeout=120000, state="visible")
            print("[e-Devlet Bot] Dashboard detected!")
        except Exception:
            if "turkiye.gov.tr" in page.url and "Giris" not in page.url:
                 print("[e-Devlet Bot] Dashboard seems loaded via URL.")
            else:
                return {"status": "error", "message": "Login timeout. Dashboard not reached."}

        # --- STEP 12 SPECIFIC LOGIC: MULTI-PORTAL NAVIGATION ---
        print("[e-Devlet Bot] Institution 1: Beşiktaş Municipality...")
        await page.click('input#searchField')
        await page.type('input#searchField', "Beşiktaş Belediyesi İş Yeri Açma", delay=300)
        await asyncio.sleep(2)
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        
        await asyncio.sleep(5)

        print("[e-Devlet Bot] Institution 2: IBB Fire Safety...")
        await page.goto("https://www.turkiye.gov.tr/ibb-itfaiye-uygunluk-belgesi-basvurusu", wait_until="networkidle", timeout=60000)
        await asyncio.sleep(5)

        print("[e-Devlet Bot] Institution 3: Health Ministry...")
        await page.goto("https://www.turkiye.gov.tr/saglik-bakanligi-hijyen-egitimi-belgesi-sorgulama", wait_until="networkidle", timeout=60000)
        await asyncio.sleep(5)

        return {"status": "success", "message": "Step 12 automation (3 portals) completed."}

    except Exception as e:
        err_trace = traceback.format_exc()
        print(f"[e-Devlet Bot] Fatal Error:\n{err_trace}")
        return {"status": "error", "message": f"e-Devlet Automation failed: {str(e)}"}
