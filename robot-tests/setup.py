#!/usr/bin/env python3
"""
Setup script for Robot Framework test environment
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Python requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error installing requirements: {e}")
        sys.exit(1)

def setup_webdriver():
    """Setup WebDriver"""
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        
        # Install ChromeDriver
        chrome_service = Service(ChromeDriverManager().install())
        print("✓ ChromeDriver installed successfully")
        
        # Test driver
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        driver = webdriver.Chrome(service=chrome_service, options=options)
        driver.quit()
        print("✓ WebDriver test successful")
        
    except Exception as e:
        print(f"✗ Error setting up WebDriver: {e}")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    dirs = ['results', 'screenshots']
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)
        print(f"✓ Created directory: {dir_name}")

if __name__ == "__main__":
    print("Setting up Robot Framework test environment...")
    create_directories()
    install_requirements()
    setup_webdriver()
    print("✓ Setup complete!")