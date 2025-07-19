#!/usr/bin/env python3
"""
Script to collect and organize screenshots from test results
"""

import os
import shutil
import glob
from datetime import datetime

def collect_screenshots():
    """Collect screenshots from results directories"""
    
    # Create screenshots directory if it doesn't exist
    screenshots_dir = "screenshots"
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # Create subdirectories for organization
    organized_dir = os.path.join(screenshots_dir, "organized")
    os.makedirs(organized_dir, exist_ok=True)
    
    # Find all PNG files in results directories
    png_files = []
    for root, dirs, files in os.walk("results"):
        for file in files:
            if file.endswith(".png"):
                png_files.append(os.path.join(root, file))
    
    if not png_files:
        print("❌ No PNG files found in results directories")
        return
    
    print(f"📸 Found {len(png_files)} screenshot files")
    
    # Copy files to organized directory
    for png_file in png_files:
        # Extract test run directory name
        path_parts = png_file.split(os.sep)
        if len(path_parts) >= 3:
            test_run = path_parts[1]  # e.g., "working_auth"
            filename = path_parts[-1]  # e.g., "successful_signin.png"
            
            # Create subdirectory for this test run
            test_run_dir = os.path.join(organized_dir, test_run)
            os.makedirs(test_run_dir, exist_ok=True)
            
            # Copy file
            dest_path = os.path.join(test_run_dir, filename)
            shutil.copy2(png_file, dest_path)
            print(f"📋 Copied: {filename} → {test_run}/{filename}")
    
    # Create an index file
    create_screenshot_index(organized_dir)
    
    print(f"\n✅ Screenshots organized in: {organized_dir}")
    print(f"📋 Index file created: {organized_dir}/index.html")

def create_screenshot_index(organized_dir):
    """Create an HTML index of all screenshots"""
    
    index_path = os.path.join(organized_dir, "index.html")
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Robot Framework Test Screenshots</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .test-run {{ margin: 20px 0; border: 1px solid #ccc; padding: 15px; }}
        .test-run h2 {{ color: #333; margin-top: 0; }}
        .screenshot {{ margin: 10px; display: inline-block; }}
        .screenshot img {{ max-width: 300px; border: 1px solid #ddd; }}
        .screenshot p {{ text-align: center; margin: 5px 0; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>🤖 Robot Framework Test Screenshots</h1>
    <p>Generated on: {timestamp}</p>
"""
    
    # Get all test run directories
    test_runs = [d for d in os.listdir(organized_dir) if os.path.isdir(os.path.join(organized_dir, d))]
    test_runs.sort()
    
    for test_run in test_runs:
        test_run_path = os.path.join(organized_dir, test_run)
        screenshots = [f for f in os.listdir(test_run_path) if f.endswith('.png')]
        screenshots.sort()
        
        if screenshots:
            html_content += f'\n    <div class="test-run">\n        <h2>📁 {test_run}</h2>\n'
            
            for screenshot in screenshots:
                screenshot_path = f"{test_run}/{screenshot}"
                html_content += f"""        <div class="screenshot">
            <img src="{screenshot_path}" alt="{screenshot}">
            <p>{screenshot}</p>
        </div>\n"""
            
            html_content += "    </div>\n"
    
    html_content += """
</body>
</html>"""
    
    with open(index_path, 'w') as f:
        f.write(html_content)

if __name__ == "__main__":
    collect_screenshots()