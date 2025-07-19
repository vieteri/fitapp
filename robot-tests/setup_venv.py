#!/usr/bin/env python3
"""
Setup script for Robot Framework test environment with virtual environment
"""

import subprocess
import sys
import os
import venv

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        if isinstance(command, list):
            result = subprocess.run(command, check=True, capture_output=True, text=True)
        else:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False

def create_virtual_environment():
    """Create a virtual environment"""
    venv_path = "venv"
    if os.path.exists(venv_path):
        print(f"✅ Virtual environment already exists at {venv_path}")
        return True
    
    print(f"🔄 Creating virtual environment at {venv_path}...")
    try:
        venv.create(venv_path, with_pip=True)
        print(f"✅ Virtual environment created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create virtual environment: {e}")
        return False

def install_requirements():
    """Install Python requirements in virtual environment"""
    # Determine the correct pip path based on OS
    if sys.platform == "win32":
        pip_path = "venv/Scripts/pip"
        python_path = "venv/Scripts/python"
    else:
        pip_path = "venv/bin/pip"
        python_path = "venv/bin/python"
    
    # Upgrade pip first
    if not run_command([python_path, "-m", "pip", "install", "--upgrade", "pip"], "Upgrading pip"):
        return False
    
    # Try to install requirements.txt first
    print("🔄 Trying to install from requirements.txt...")
    if run_command([pip_path, "install", "-r", "requirements.txt"], "Installing Python requirements"):
        return True
    
    # If that fails, try minimal requirements
    print("⚠️  requirements.txt failed, trying minimal requirements...")
    if run_command([pip_path, "install", "-r", "requirements-minimal.txt"], "Installing minimal Python requirements"):
        return True
    
    # If both fail, install packages individually
    print("⚠️  Trying to install packages individually...")
    packages = [
        "robotframework",
        "robotframework-seleniumlibrary", 
        "robotframework-screencaplibrary",
        "robotframework-requests",
        "selenium",
        "webdriver-manager",
        "Pillow"
    ]
    
    for package in packages:
        if not run_command([pip_path, "install", package], f"Installing {package}"):
            print(f"⚠️  Failed to install {package}, continuing...")
    
    # Check if Robot Framework was installed
    if run_command([python_path, "-c", "import robot; print('Robot Framework installed successfully')"], "Checking Robot Framework installation"):
        return True
    
    return False

def setup_webdriver():
    """Setup WebDriver"""
    # Determine the correct python path based on OS
    if sys.platform == "win32":
        python_path = "venv/Scripts/python"
    else:
        python_path = "venv/bin/python"
    
    test_script = """
try:
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    
    # Install ChromeDriver
    chrome_service = Service(ChromeDriverManager().install())
    print("✅ ChromeDriver installed successfully")
    
    # Test driver
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(service=chrome_service, options=options)
    driver.quit()
    print("✅ WebDriver test successful")
    
except Exception as e:
    print(f"❌ Error setting up WebDriver: {e}")
    exit(1)
"""
    
    if not run_command([python_path, "-c", test_script], "Setting up WebDriver"):
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    dirs = ['results', 'screenshots']
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)
        print(f"✅ Created directory: {dir_name}")

def create_activation_scripts():
    """Create activation scripts for convenience"""
    
    # Create activation script for Unix/macOS
    activate_script = """#!/bin/bash
# Activate the Robot Framework virtual environment
source venv/bin/activate
echo "✅ Robot Framework virtual environment activated!"
echo "💡 To run tests: python run_tests.py"
echo "💡 To deactivate: deactivate"
"""
    
    with open("activate.sh", "w") as f:
        f.write(activate_script)
    
    # Make it executable
    os.chmod("activate.sh", 0o755)
    
    # Create activation script for Windows
    activate_bat = """@echo off
call venv\\Scripts\\activate.bat
echo ✅ Robot Framework virtual environment activated!
echo 💡 To run tests: python run_tests.py
echo 💡 To deactivate: deactivate
"""
    
    with open("activate.bat", "w") as f:
        f.write(activate_bat)
    
    print("✅ Created activation scripts: activate.sh (Unix/macOS) and activate.bat (Windows)")

if __name__ == "__main__":
    print("🚀 Setting up Robot Framework test environment with virtual environment...")
    
    # Create directories
    create_directories()
    
    # Create virtual environment
    if not create_virtual_environment():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Setup WebDriver
    if not setup_webdriver():
        sys.exit(1)
    
    # Create activation scripts
    create_activation_scripts()
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment:")
    print("   source activate.sh     # On macOS/Linux")
    print("   activate.bat          # On Windows")
    print("2. Run tests:")
    print("   python run_tests.py")
    print("3. Deactivate when done:")
    print("   deactivate")