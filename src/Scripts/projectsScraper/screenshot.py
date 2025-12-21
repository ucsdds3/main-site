"""
Screenshot capture functionality for project websites.
"""

import sys
import os
import re
import requests
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright

    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from PIL import Image

    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


def extract_main_title(title):
    """Extract the main title part before any parentheses."""
    # Split on '(' and take the first part, then strip whitespace
    main_title = title.split("(")[0].strip()
    return main_title


def sanitize_filename(title):
    """Convert project title to a safe filename."""
    # Extract main title (before parentheses) first
    main_title = extract_main_title(title)
    # Remove special characters and replace spaces with underscores
    filename = re.sub(r"[^\w\s-]", "", main_title)
    filename = re.sub(r"[-\s]+", "_", filename)
    return filename.lower()


def take_screenshot(url, output_path, is_streamlit=False):
    """
    Take a screenshot of a website.

    Args:
        url: Website URL to screenshot
        output_path: Path to save the screenshot
        is_streamlit: If True, handle Streamlit app (click button, get img src)

    Returns:
        str: Path to saved image, or None if failed
    """
    if not PLAYWRIGHT_AVAILABLE:
        print(
            f"Warning: Playwright not available. Install with: pip install playwright && playwright install",
            file=sys.stderr,
        )
        return None

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Set a reasonable viewport size
            page.set_viewport_size({"width": 1920, "height": 1080})

            # Navigate to the page
            page.goto(url, wait_until="networkidle", timeout=30000)

            if is_streamlit:
                # Wait for and click the "Yes, get this app back up!" button
                try:
                    # Look for the button - it might have different text variations
                    button_selectors = [
                        'button:has-text("Yes, get this app back up!")',
                        'button:has-text("Yes")',
                        '[data-testid="stButton"]:has-text("Yes")',
                        'button >> text="Yes"',
                    ]

                    button_clicked = False
                    for selector in button_selectors:
                        try:
                            page.wait_for_selector(selector, timeout=5000)
                            page.click(selector)
                            page.wait_for_timeout(2000)  # Wait for app to load
                            button_clicked = True
                            break
                        except:
                            continue

                    if not button_clicked:
                        print(f"Warning: Could not find Streamlit button on {url}", file=sys.stderr)

                    # Wait for the app to load after clicking
                    page.wait_for_timeout(5000)

                    # Wait for the main content to load
                    try:
                        # Wait for Streamlit's main content area
                        page.wait_for_selector('[data-testid="stApp"]', timeout=10000)
                    except:
                        pass  # Continue even if selector not found

                    # Try to find an img element with meaningful content
                    # Look for images that might be screenshots or previews
                    img_elements = page.query_selector_all("img")
                    screenshot_taken = False

                    for img in img_elements:
                        src = img.get_attribute("src")
                        if (
                            src
                            and src.startswith("http")
                            and not any(
                                skip in src.lower()
                                for skip in ["icon", "logo", "favicon", "avatar"]
                            )
                        ):
                            # Try to download this image
                            try:
                                img_response = requests.get(
                                    src, timeout=10, headers={"User-Agent": "Mozilla/5.0"}
                                )
                                if (
                                    img_response.status_code == 200
                                    and len(img_response.content) > 1000
                                ):  # Ensure it's a real image
                                    # Save temporarily and convert to WebP if needed
                                    temp_img_path = output_path.replace(".webp", "_temp")
                                    with open(temp_img_path, "wb") as f:
                                        f.write(img_response.content)

                                    # Convert to WebP if PIL is available
                                    if PIL_AVAILABLE:
                                        try:
                                            img_pil = Image.open(temp_img_path)
                                            img_pil.save(output_path, "WEBP", quality=85)
                                            os.remove(temp_img_path)
                                        except:
                                            # If conversion fails, just rename
                                            if os.path.exists(temp_img_path):
                                                os.rename(temp_img_path, output_path)
                                    else:
                                        # If PIL not available, just rename
                                        if os.path.exists(temp_img_path):
                                            os.rename(temp_img_path, output_path)

                                    screenshot_taken = True
                                    break
                            except:
                                continue

                    # If no suitable img found or download failed, take a screenshot of the page
                    if not screenshot_taken:
                        # Save as PNG first, then convert to WebP if PIL is available
                        temp_path = output_path.replace(".webp", ".png")
                        page.screenshot(path=temp_path, full_page=True)
                        if PIL_AVAILABLE and os.path.exists(temp_path):
                            img = Image.open(temp_path)
                            img.save(output_path, "WEBP", quality=85)
                            os.remove(temp_path)
                        else:
                            # If PIL not available, rename PNG to webp
                            if os.path.exists(temp_path):
                                os.rename(temp_path, output_path)
                except Exception as e:
                    print(f"Warning: Error handling Streamlit app {url}: {e}", file=sys.stderr)
                    # Fall back to regular screenshot
                    temp_path = output_path.replace(".webp", ".png")
                    page.screenshot(path=temp_path, full_page=True)
                    if PIL_AVAILABLE and os.path.exists(temp_path):
                        img = Image.open(temp_path)
                        img.save(output_path, "WEBP", quality=85)
                        os.remove(temp_path)
                    else:
                        if os.path.exists(temp_path):
                            os.rename(temp_path, output_path)
            else:
                # Regular screenshot - save as PNG first, then convert
                temp_path = output_path.replace(".webp", ".png")
                page.screenshot(path=temp_path, full_page=True)
                if PIL_AVAILABLE and os.path.exists(temp_path):
                    img = Image.open(temp_path)
                    img.save(output_path, "WEBP", quality=85)
                    os.remove(temp_path)
                else:
                    if os.path.exists(temp_path):
                        os.rename(temp_path, output_path)

            browser.close()
            return output_path

    except Exception as e:
        print(f"Error taking screenshot of {url}: {e}", file=sys.stderr)
        return None


def capture_project_screenshots(projects, folder_key="FA2025", output_dir=None):
    """
    Capture screenshots for all projects that have websites.

    Args:
        projects: List of project dictionaries
        folder_key: Key for folder name (spaces removed, uppercase)
        output_dir: Directory to save screenshots (defaults to public/projects/{folder_key} from project root)

    Returns:
        dict: Mapping of project titles to image paths
    """
    if output_dir is None:
        # Resolve path relative to project root
        # __file__ is in projectsScraper/screenshot.py, so:
        # projectsScraper -> Scripts -> src -> project root
        project_root = Path(__file__).parent.parent.parent.parent
        output_dir = project_root / "public" / "projects" / folder_key
    if not PLAYWRIGHT_AVAILABLE:
        print("Skipping screenshots - Playwright not available", file=sys.stderr)
        return {}

    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    image_paths = {}

    for project in projects:
        website = project.get("website")
        if not website:
            continue

        # Clean up URL (remove trailing colons, etc.)
        website = website.rstrip(": ").strip()
        if not website.startswith("http"):
            continue

        title = project.get("title", "unknown")
        filename = sanitize_filename(title) + ".webp"
        output_path = os.path.join(output_dir, filename)

        # Check if it's a Streamlit app
        is_streamlit = "streamlit.app" in website.lower()

        print(f"Capturing screenshot for {title}...", file=sys.stderr)
        result = take_screenshot(website, output_path, is_streamlit=is_streamlit)

        # Only add image path if screenshot was successfully saved (file exists)
        if result and os.path.exists(output_path):
            # Store relative path from public directory
            relative_path = f"/Projects/{folder_key}/{filename}"
            image_paths[title] = relative_path
            print(f"  Saved to {relative_path}", file=sys.stderr)
        else:
            print(f"  Failed to capture screenshot", file=sys.stderr)

    return image_paths
