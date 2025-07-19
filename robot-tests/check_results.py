#!/usr/bin/env python3
"""
Quick script to check Robot Framework test results
"""

import os
import sys
import xml.etree.ElementTree as ET
from datetime import datetime

def check_latest_results():
    """Check the latest test results"""
    results_dir = "results"
    
    if not os.path.exists(results_dir):
        print("❌ No results directory found")
        return
    
    # Get the latest results folder (excluding test_run)
    folders = [d for d in os.listdir(results_dir) if os.path.isdir(os.path.join(results_dir, d)) and d != "test_run"]
    if not folders:
        print("❌ No test results found")
        return
    
    latest_folder = max(folders)
    latest_path = os.path.join(results_dir, latest_folder)
    
    print(f"📁 Latest results: {latest_path}")
    
    # Check output.xml
    output_xml = os.path.join(latest_path, "output.xml")
    if os.path.exists(output_xml):
        try:
            tree = ET.parse(output_xml)
            root = tree.getroot()
            
            # Get test statistics from suite stats
            suite_stats = root.find(".//statistics/suite/stat")
            if suite_stats is not None:
                passed = suite_stats.get("pass", "0")
                failed = suite_stats.get("fail", "0")
                print(f"✅ Passed: {passed}")
                print(f"❌ Failed: {failed}")
                
                # Get failed tests
                failed_tests = root.findall(".//test[@status='FAIL']")
                if failed_tests:
                    print("\n🔍 Failed tests:")
                    for test in failed_tests:
                        name = test.get("name")
                        # Get failure message
                        msg = test.find(".//message")
                        if msg is not None:
                            message = msg.text[:100] + "..." if len(msg.text) > 100 else msg.text
                            print(f"  • {name}: {message}")
                        else:
                            print(f"  • {name}")
                
                # Check if screenshots exist
                screenshots_dir = os.path.join(latest_path, "screenshots")
                if os.path.exists(screenshots_dir):
                    screenshot_count = len([f for f in os.listdir(screenshots_dir) if f.endswith('.png')])
                    print(f"📸 Screenshots: {screenshot_count}")
                
                # Check selenium screenshots
                selenium_screenshots = [f for f in os.listdir(latest_path) if f.startswith("selenium-screenshot")]
                if selenium_screenshots:
                    print(f"🖼️  Selenium screenshots: {len(selenium_screenshots)}")
                
                # Get report paths
                report_html = os.path.join(latest_path, "report.html")
                log_html = os.path.join(latest_path, "log.html")
                
                if os.path.exists(report_html):
                    print(f"📄 Report: {report_html}")
                if os.path.exists(log_html):
                    print(f"📋 Log: {log_html}")
                
        except Exception as e:
            print(f"❌ Error reading output.xml: {e}")
    else:
        print("❌ No output.xml found")

if __name__ == "__main__":
    check_latest_results()