#!/usr/bin/env python3
"""
Debug BabySU Child Profile Creation
Captures console logs, network requests, and errors
"""

from playwright.sync_api import sync_playwright
import json

def debug_child_profile():
    console_logs = []
    network_logs = []
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": msg.text,
            "location": msg.location
        }))

        # Capture network requests
        page.on("request", lambda request: network_logs.append({
            "method": request.method,
            "url": request.url,
            "headers": dict(request.headers) if request.headers else {}
        }))

        # Capture network responses
        page.on("response", lambda response: network_logs.append({
            "status": response.status,
            "url": response.url,
            "ok": response.ok
        }))

        # Capture page errors
        page.on("pageerror", lambda error: errors.append(str(error)))

        print("🌐 Navigating to BabySU webapp...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')

        print("📸 Taking screenshot of initial page...")
        page.screenshot(path='/data/data/com.termux/files/home/proj/babysu/screenshot_1_initial.png', full_page=True)

        # Check current URL and title
        print(f"✅ Page loaded: {page.title()}")
        print(f"✅ Current URL: {page.url}")

        # Wait a bit for React to fully render
        page.wait_for_timeout(2000)

        # Find and click guest login button
        print("\n🔍 Looking for guest login button...")
        guest_buttons = page.locator('text=/guest/i').all()
        print(f"Found {len(guest_buttons)} elements with 'guest' text")

        # Try to find continue as guest button
        try:
            guest_btn = page.locator('button:has-text("Guest")').first
            if guest_btn.is_visible():
                print("✅ Found guest button, clicking...")
                guest_btn.click()
                page.wait_for_timeout(2000)
                print("📸 Taking screenshot after guest login...")
                page.screenshot(path='/data/data/com.termux/files/home/proj/babysu/screenshot_2_after_guest_login.png', full_page=True)
            else:
                print("⚠️ Guest button not visible")
        except Exception as e:
            print(f"⚠️ Could not click guest button: {e}")
            print("Trying alternative selectors...")

            # Try all buttons
            all_buttons = page.locator('button').all()
            print(f"Found {len(all_buttons)} total buttons")
            for i, btn in enumerate(all_buttons):
                try:
                    text = btn.inner_text()
                    if 'guest' in text.lower() or 'continue' in text.lower():
                        print(f"Found button {i}: {text}")
                        btn.click()
                        page.wait_for_timeout(2000)
                        break
                except:
                    pass

        # Check localStorage
        print("\n🔍 Checking localStorage...")
        storage = page.evaluate('''() => {
            return {
                userId: localStorage.getItem('userId'),
                guestMode: localStorage.getItem('guestMode'),
                guestUserId: localStorage.getItem('guestUserId')
            }
        }''')
        print(f"LocalStorage: {json.dumps(storage, indent=2)}")

        # Check if we're authenticated
        print("\n🔍 Checking authentication state...")
        auth_state = page.evaluate('''() => {
            return window.location.pathname
        }''')
        print(f"Current path: {auth_state}")

        # Try to navigate to children page
        print("\n🔍 Navigating to children page...")
        page.goto('http://localhost:5173/children')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        print("📸 Taking screenshot of children page...")
        page.screenshot(path='/data/data/com.termux/files/home/proj/babysu/screenshot_3_children_page.png', full_page=True)

        # Look for "Add Child" button
        print("\n🔍 Looking for Add Child button...")
        add_buttons = page.locator('button').all()
        print(f"Found {len(add_buttons)} buttons on children page")

        for i, btn in enumerate(add_buttons):
            try:
                text = btn.inner_text()
                if text and len(text) < 50:  # Only print short button texts
                    print(f"  Button {i}: '{text}'")
            except:
                pass

        # Try to click Add Child
        try:
            add_child_btn = page.locator('button:has-text("Add")').first
            if add_child_btn.is_visible():
                print("✅ Clicking Add Child button...")
                add_child_btn.click()
                page.wait_for_timeout(2000)

                print("📸 Taking screenshot of add child form...")
                page.screenshot(path='/data/data/com.termux/files/home/proj/babysu/screenshot_4_add_form.png', full_page=True)

                # Fill the form
                print("\n📝 Filling child form...")
                name_input = page.locator('input[name="name"], input[placeholder*="name" i]').first
                age_input = page.locator('input[name="age"], input[type="number"]').first

                if name_input.is_visible():
                    name_input.fill("Emma Test")
                    print("✅ Filled name: Emma Test")

                if age_input.is_visible():
                    age_input.fill("2")
                    print("✅ Filled age: 2")

                page.wait_for_timeout(1000)

                # Look for save button
                print("\n🔍 Looking for Save button...")
                save_buttons = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")').all()
                print(f"Found {len(save_buttons)} potential save buttons")

                if save_buttons:
                    print("✅ Clicking Save button...")
                    save_buttons[0].click()

                    # Wait for response
                    print("⏳ Waiting for API response...")
                    page.wait_for_timeout(3000)

                    print("📸 Taking screenshot after save...")
                    page.screenshot(path='/data/data/com.termux/files/home/proj/babysu/screenshot_5_after_save.png', full_page=True)
                else:
                    print("❌ No save button found")

        except Exception as e:
            print(f"❌ Error during form interaction: {e}")

        # Check final localStorage state
        print("\n🔍 Final localStorage check...")
        final_storage = page.evaluate('''() => {
            return {
                userId: localStorage.getItem('userId'),
                guestMode: localStorage.getItem('guestMode'),
                children: localStorage.getItem('babysu_children')
            }
        }''')
        print(f"Final LocalStorage: {json.dumps(final_storage, indent=2)}")

        browser.close()

    # Report findings
    print("\n" + "="*60)
    print("📊 DEBUG REPORT")
    print("="*60)

    print("\n🖥️  CONSOLE LOGS:")
    for log in console_logs[-20:]:  # Last 20 logs
        print(f"  [{log['type']}] {log['text']}")

    print("\n🌐 NETWORK ACTIVITY (API calls only):")
    for net in network_logs:
        if 'method' in net and ('localhost:5000' in net['url'] or '/api/' in net['url']):
            print(f"  {net['method']} {net['url']}")
            if 'x-user-id' in net.get('headers', {}):
                print(f"    └─ User-ID: {net['headers']['x-user-id']}")
        elif 'status' in net and ('localhost:5000' in net['url'] or '/api/' in net['url']):
            print(f"  └─ Response: {net['status']} {'✅' if net['ok'] else '❌'}")

    print("\n❌ PAGE ERRORS:")
    if errors:
        for error in errors:
            print(f"  {error}")
    else:
        print("  None")

    print("\n📸 Screenshots saved:")
    print("  1. screenshot_1_initial.png - Initial page load")
    print("  2. screenshot_2_after_guest_login.png - After guest login")
    print("  3. screenshot_3_children_page.png - Children list page")
    print("  4. screenshot_4_add_form.png - Add child form")
    print("  5. screenshot_5_after_save.png - After clicking save")

if __name__ == "__main__":
    debug_child_profile()
