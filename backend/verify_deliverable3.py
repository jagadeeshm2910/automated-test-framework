#!/usr/bin/env python3
"""
Final verification script for Deliverable 3 completion
Run this to verify everything is working correctly
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n🔧 {description}")
    print(f"   Command: {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd='/Users/jm237/Desktop/copilot-test-framework/backend')
        
        if result.returncode == 0:
            print(f"   ✅ Success")
            if result.stdout.strip():
                # Show last few lines of output
                lines = result.stdout.strip().split('\n')
                for line in lines[-3:]:
                    print(f"   📝 {line}")
            return True
        else:
            print(f"   ❌ Failed (exit code: {result.returncode})")
            if result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    print("=" * 70)
    print("🧪 DELIVERABLE 3 VERIFICATION")
    print("📦 Web Scraper Implementation - Final Check")
    print("=" * 70)
    
    # Change to backend directory
    os.chdir('/Users/jm237/Desktop/copilot-test-framework/backend')
    
    tests = [
        ("source venv/bin/activate && python -c \"import app.services.web_scraper; print('Web scraper import: OK')\"", 
         "Import web scraper service"),
        
        ("source venv/bin/activate && python -c \"import app.services.github_scanner; print('GitHub scanner import: OK')\"", 
         "Import GitHub scanner service"),
        
        ("source venv/bin/activate && python -c \"from app.models.schemas import SourceType, FieldType; print(f'Enums: {len(SourceType)} source types, {len(FieldType)} field types')\"", 
         "Check updated enums"),
        
        ("source venv/bin/activate && python -c \"from app.api.extraction import router; print('Extraction API import: OK')\"", 
         "Import extraction API"),
        
        ("source venv/bin/activate && python -m pytest tests/test_extraction.py::test_extract_url_metadata -v", 
         "Test URL extraction"),
        
        ("source venv/bin/activate && python -m pytest tests/test_metadata.py::test_metadata_workflow -v", 
         "Test metadata workflow"),
        
        ("source venv/bin/activate && python -m pytest tests/ --tb=no -q", 
         "Run full test suite"),
    ]
    
    passed = 0
    total = len(tests)
    
    for cmd, description in tests:
        if run_command(cmd, description):
            passed += 1
    
    print("\n" + "=" * 70)
    print(f"📊 VERIFICATION RESULTS: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("🎉 DELIVERABLE 3 VERIFICATION: PASSED")
        print("✅ Web Scraper Implementation is complete and working!")
        print("\n🚀 Ready to proceed to Deliverable 4: AI Data Generator")
    else:
        print("⚠️  DELIVERABLE 3 VERIFICATION: PARTIAL SUCCESS")
        print("🔧 Some components may need attention")
    
    print("=" * 70)
    
    print("\n📋 MANUAL VERIFICATION STEPS:")
    print("1. Start server: cd backend && ./start.sh")
    print("2. Test API: curl http://localhost:8000/health")
    print("3. Run tests: cd backend && python -m pytest tests/ -v")
    print("4. Test scraper: cd backend && python test_scraper.py")

if __name__ == "__main__":
    main()
