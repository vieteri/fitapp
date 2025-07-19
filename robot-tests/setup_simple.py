#!/usr/bin/env python3
"""
Simple setup script for Robot Framework test environment
Works with Python 3.13 and handles package compatibility issues
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
        print(f"❌ {description} failed")
        print(f"Command: {' '.join(command) if isinstance(command, list) else command}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def setup_environment():
    """Setup the complete environment"""
    
    # Create directories
    os.makedirs("results", exist_ok=True)
    os.makedirs("screenshots", exist_ok=True)
    print("✅ Created directories: results, screenshots")
    
    # Create virtual environment
    venv_path = "venv"
    if not os.path.exists(venv_path):
        print(f"🔄 Creating virtual environment...")
        try:
            venv.create(venv_path, with_pip=True)
            print(f"✅ Virtual environment created")
        except Exception as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    
    # Determine paths
    if sys.platform == "win32":
        pip_path = "venv/Scripts/pip"
        python_path = "venv/Scripts/python"
    else:
        pip_path = "venv/bin/pip"
        python_path = "venv/bin/python"
    
    # Upgrade pip
    run_command([python_path, "-m", "pip", "install", "--upgrade", "pip"], "Upgrading pip")
    
    # Install packages one by one with fallback versions
    packages = [
        ("robotframework", "Robot Framework"),
        ("selenium", "Selenium WebDriver"),
        ("webdriver-manager", "WebDriver Manager"),
        ("robotframework-seleniumlibrary", "Robot Framework Selenium Library"),
        ("Pillow", "Pillow (Image processing)"),
        ("robotframework-requests", "Robot Framework Requests Library"),
    ]
    
    installed_packages = []
    
    for package, description in packages:
        if run_command([pip_path, "install", package], f"Installing {description}"):
            installed_packages.append(package)
        else:
            print(f"⚠️  Failed to install {package}, continuing...")
    
    # Try to install screencap library (may not be compatible with Python 3.13)
    if not run_command([pip_path, "install", "robotframework-screencaplibrary"], "Installing Robot Framework ScreenCap Library"):
        print("⚠️  ScreenCap library not compatible with Python 3.13, using alternative screenshot method")
    
    # Verify Robot Framework installation
    if run_command([python_path, "-c", "import robot; print('Robot Framework version:', robot.__version__)"], "Verifying Robot Framework"):
        print("✅ Robot Framework is working correctly")
    else:
        print("❌ Robot Framework installation failed")
        return False
    
    # Test Selenium WebDriver
    test_selenium = """
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get('https://www.google.com')
    print('✅ Selenium WebDriver test successful')
    driver.quit()
except Exception as e:
    print(f'⚠️  Selenium WebDriver test failed: {e}')
    print('You may need to install Chrome browser or update ChromeDriver manually')
"""
    
    run_command([python_path, "-c", test_selenium], "Testing Selenium WebDriver")
    
    # Create activation scripts
    create_activation_scripts()
    
    print("\n🎉 Setup completed!")
    print(f"✅ Installed packages: {', '.join(installed_packages)}")
    print("\n📋 Next steps:")
    print("1. Activate virtual environment: source activate.sh")
    print("2. Run tests: python run_tests.py")
    print("3. Deactivate when done: deactivate")
    
    return True

def create_activation_scripts():
    """Create activation scripts"""
    # Unix/macOS activation script
    activate_script = """#!/bin/bash
source venv/bin/activate
echo "✅ Robot Framework virtual environment activated!"
echo "🚀 Python version: $(python --version)"
echo "🤖 Robot Framework version: $(python -c 'import robot; print(robot.__version__)')"
echo "💡 To run tests: python run_tests.py"
echo "💡 To deactivate: deactivate"
"""
    
    with open("activate.sh", "w") as f:
        f.write(activate_script)
    os.chmod("activate.sh", 0o755)
    
    # Windows activation script
    activate_bat = """@echo off
call venv\\Scripts\\activate.bat
echo ✅ Robot Framework virtual environment activated!
python -c "import sys; print('🚀 Python version:', sys.version)"
python -c "import robot; print('🤖 Robot Framework version:', robot.__version__)"
echo 💡 To run tests: python run_tests.py
echo 💡 To deactivate: deactivate
"""
    
    with open("activate.bat", "w") as f:
        f.write(activate_bat)
    
    print("✅ Created activation scripts")

if __name__ == "__main__":
    print("🚀 Setting up Robot Framework test environment (Python 3.13 compatible)...")
    
    if setup_environment():
        print("\n🎉 Setup successful! You can now run tests.")
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)