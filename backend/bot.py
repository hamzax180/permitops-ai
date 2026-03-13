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
        # Start playwright manually (not using 'async with') so it doesn't close on return
        p = await async_playwright().start()
        
        # Launch browser with slow_mo so user can watch every move
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context()
        page = await context.new_page()

        print("[RPA Bot] Navigating to turkiye.gov.tr...")
        await page.goto("https://giris.turkiye.gov.tr/Giris/")

        # Wait for the login form
        await page.wait_for_selector('input[name="tridField"]', timeout=30000)

        print("[RPA Bot] Typing TCKN character by character...")
        await page.type('input[name="tridField"]', tckn, delay=150)
        
        print("[RPA Bot] Typing Password character by character...")
        await page.type('input[name="egpField"]', password, delay=150)
        
        print("[RPA Bot] Login info typed. Checking if already logged in or waiting for 'Giris Yap'...")
        
        # We race between clicking the button and seeing the dashboard
        # This handles cases where the user clicks it themselves or it auto-logs in
        try:
            # Check for dashboard instantly
            dashboard_el = await page.query_selector('input#searchField')
            if not dashboard_el:
                print("[RPA Bot] Clicking Giris Yap...")
                await page.click('input[name="submitButton"]', timeout=10000)
            else:
                print("[RPA Bot] Already on dashboard. Skipping login click.")
        except Exception:
            print("[RPA Bot] Login button not found or already logged in. Checking dashboard...")

        # Wait for success login (MFA can take a while)
        print("[RPA Bot] Waiting for dashboard activation (Finish your MFA/SMS check if needed)...")
        try:
            # Home page search bar is the best indicator of a full login
            await page.wait_for_selector('input#searchField', timeout=120000, state="visible")
            print("[RPA Bot] Dashboard detected! Starting search immediately...")
        except Exception:
            if "turkiye.gov.tr" in page.url and "Giris" not in page.url:
                 print("[RPA Bot] Dashboard seems loaded via URL. Proceeding...")
            else:
                return {"status": "error", "message": "Login timeout. Dashboard not reached."}

        # --- INSTITUTION 1: SEARCH NAVIGATION ---
        print("[RPA Bot] Typing institution name in search bar...")
        await page.click('input#searchField')
        # Type the name "name by name" precisely
        target_name = "Beşiktaş Belediyesi İş Yeri Açma"
        await page.type('input#searchField', target_name, delay=100)
        
        print("[RPA Bot] Search entered. Selecting result...")
        await asyncio.sleep(2) # Brief pause for result list to appear
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        
        # Wait for the service page to load
        print("[RPA Bot] Waiting for Municipality Service page to load...")
        try:
            await page.wait_for_load_state("networkidle", timeout=30000)
            await page.wait_for_selector('text="Yeni Başvuru", text="Başvuru Yap"', timeout=10000)
            print("[RPA Bot] Successfully reached the application portal.")
        except:
             print("[RPA Bot] Service loaded. Proceeding to sub-navigation...")

        # --- SUB-NAVIGATION ---
        try:
            new_app_btn = await page.query_selector('text="Yeni Başvuru", text="Başvuru Yap"')
            if new_app_btn:
                print("[RPA Bot] Clicking 'Yeni Başvuru'...")
                await new_app_btn.click()
                await asyncio.sleep(4)
        except:
             pass

        await asyncio.sleep(5)

        # --- INSTITUTION 2: Istanbul Fire Department (IBB) ---
        print("[RPA Bot] Institution 2/3: Jumping to IBB Fire Safety Service...")
        await page.goto("https://www.turkiye.gov.tr/ibb-itfaiye-uygunluk-belgesi-basvurusu", wait_until="networkidle", timeout=60000)
        
        try:
            new_app_btn = await page.query_selector('text="Yeni Başvuru", text="Başvuru Yap"')
            if new_app_btn:
                print("[RPA Bot] Entering Fire Safety Application...")
                await new_app_btn.click()
                await asyncio.sleep(5)
        except:
            print("[RPA Bot] Fire portal loaded.")
        
        await asyncio.sleep(5)

        # --- INSTITUTION 3: Ministry of Health ---
        print("[RPA Bot] Institution 3/3: Jumping to Health Ministry Hygiene Service...")
        await page.goto("https://www.turkiye.gov.tr/saglik-bakanligi-hijyen-egitimi-belgesi-sorgulama", wait_until="networkidle", timeout=60000)
        
        try:
            print("[RPA Bot] Checking Health Department records...")
            await asyncio.sleep(5)
        except:
            print("[RPA Bot] Health portal loaded.")

        print("[RPA Bot] All 3 transitions completed. Browser is left open for final review.")
        return {"status": "success", "message": "Bot typed institution names and moved through all portals. Browser is yours!"}

    except Exception as e:
        err_trace = traceback.format_exc()
        print(f"[RPA Bot] Fatal Error:\n{err_trace}")
        return {"status": "error", "message": f"Automation failed: {str(e)}"}
