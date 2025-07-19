#!/usr/bin/env python3
"""
Test runner script for Robot Framework test suite
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime

def get_venv_python():
    """Get the correct Python path for virtual environment"""
    if sys.platform == "win32":
        return "venv/Scripts/python.exe"
    else:
        return "venv/bin/python"

def get_venv_robot():
    """Get the correct Robot Framework path for virtual environment"""
    if sys.platform == "win32":
        return "venv/Scripts/robot.exe"
    else:
        return "venv/bin/robot"

def check_venv():
    """Check if virtual environment is available"""
    venv_python = get_venv_python()
    if os.path.exists(venv_python):
        return True
    return False

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Run Robot Framework tests')
    parser.add_argument('--suite', choices=['auth', 'exercises', 'routines', 'workouts', 'profile', 'all'], 
                       default='all', help='Test suite to run')
    parser.add_argument('--tags', help='Run tests with specific tags (e.g., smoke, positive)')
    parser.add_argument('--browser', choices=['chrome', 'firefox', 'safari', 'edge'], 
                       default='chrome', help='Browser to use for testing')
    parser.add_argument('--headless', action='store_true', help='Run browser in headless mode')
    parser.add_argument('--parallel', type=int, help='Number of parallel processes')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Check if virtual environment is available
    if check_venv():
        robot_executable = get_venv_robot()
        print(f"✅ Using virtual environment: {robot_executable}")
    else:
        robot_executable = "robot"
        print("⚠️  Virtual environment not found, using system Robot Framework")
        print("💡 Run 'python3 setup_venv.py' to create virtual environment")
    
    # Create results directory with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_dir = f"results/{timestamp}"
    os.makedirs(results_dir, exist_ok=True)
    
    # Build robot command
    robot_cmd = [robot_executable]
    robot_cmd.extend(["--outputdir", results_dir])
    
    # Add browser configuration
    robot_cmd.extend(["--variable", f"BROWSER:{args.browser.title()}"])
    
    # Add headless mode if specified
    if args.headless:
        robot_cmd.extend(["--variable", "HEADLESS:True"])
    
    # Add tags if specified
    if args.tags:
        robot_cmd.extend(["--include", args.tags])
    
    # Add parallel processing if specified
    if args.parallel:
        robot_cmd.extend(["--processes", str(args.parallel)])
    
    # Add verbose logging if specified
    if args.verbose:
        robot_cmd.extend(["--loglevel", "TRACE"])
    
    # Add test path based on suite selection
    if args.suite == 'all':
        robot_cmd.append("tests/")
    else:
        robot_cmd.append(f"tests/{args.suite}/")
    
    # Join command for execution
    command = " ".join(robot_cmd)
    
    print(f"🚀 Starting Robot Framework tests...")
    print(f"📁 Results will be saved to: {results_dir}")
    print(f"🤖 Command: {command}")
    print("-" * 80)
    
    # Run the tests
    result = run_command(command, "Robot Framework test execution")
    
    if result is not None:
        print(f"📊 Test results available in: {results_dir}")
        print(f"📄 Report: {results_dir}/report.html")
        print(f"📋 Log: {results_dir}/log.html")
        print(f"🖼️  Screenshots: screenshots/")
        
        # Try to open report if on macOS
        if sys.platform == "darwin":
            open_cmd = f"open {results_dir}/report.html"
            print(f"🌐 Opening report in browser...")
            subprocess.run(open_cmd, shell=True)
    
    return 0 if result is not None else 1

if __name__ == "__main__":
    sys.exit(main())