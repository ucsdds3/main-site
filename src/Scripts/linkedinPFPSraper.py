import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os
from dotenv import load_dotenv

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in headless mode
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_to_linkedin(driver):
    # Load environment variables
    load_dotenv()
    
    # Get LinkedIn credentials from environment variables
    email = os.getenv('LINKEDIN_EMAIL')
    password = os.getenv('LINKEDIN_PASSWORD')
    
    if not email or not password:
        raise ValueError("LinkedIn credentials not found in environment variables")
    
    # Go to LinkedIn login page
    driver.get('https://www.linkedin.com/login')
    
    # Wait for and fill in email
    wait = WebDriverWait(driver, 10)
    email_field = wait.until(EC.presence_of_element_located((By.ID, "username")))
    email_field.send_keys(email)
    
    # Fill in password
    password_field = driver.find_element(By.ID, "password")
    password_field.send_keys(password)
    
    # Click login button
    login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    login_button.click()
    
    # Wait for login to complete
    time.sleep(5)

def get_profile_picture_url(driver, linkedin_url):
    try:
        driver.get(linkedin_url)
        # Wait for the profile picture to load using the specific element structure
        wait = WebDriverWait(driver, 10)
        profile_pic = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "img.pv-top-card-profile-picture__image--show"))
        )
        print("Found profile picture element!")
        return profile_pic.get_attribute('src')
    except (TimeoutException, NoSuchElementException) as e:
        print(f"Error getting profile picture for {linkedin_url}: {str(e)}")
        return None

def main():
    # Load alumni data
    json_path = 'src/Assets/Data/alumni.json'
    with open(json_path, 'r') as f:
        alumni_data = json.load(f)
    
    driver = setup_driver()
    
    try:
        # Login to LinkedIn first
        print("Logging into LinkedIn...")
        login_to_linkedin(driver)
        print("Login successful!")
        
        # Process all profiles
        for alumni in alumni_data:
            if 'linkedin' in alumni:
                print(f"\nProcessing {alumni['name']}...")
                profile_pic_url = get_profile_picture_url(driver, alumni['linkedin'])
                if profile_pic_url:
                    alumni['image'] = profile_pic_url
                time.sleep(2)  # Add delay between requests to avoid rate limiting
        
        # Save updated data back to JSON file
        with open(json_path, 'w') as f:
            json.dump(alumni_data, f, indent=2)
        print("\nUpdated JSON file with profile picture URLs!")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
