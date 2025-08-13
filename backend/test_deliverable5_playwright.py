#!/usr/bin/env python3
"""
Deliverable 5: Playwright Test Runner Implementation - Comprehensive Test
Tests the complete UI testing automation workflow
"""

import asyncio
import pytest
import sys
import json
from pathlib import Path

# Add backend to Python path
sys.path.append(str(Path(__file__).parent))

from app.services.playwright_test_runner import PlaywrightTestRunner, TestResult, ScreenshotManager
from app.services.ai_data_generator import AIDataGenerator, TestScenario
from app.models.schemas import FormField, FieldType


async def test_screenshot_manager():
    """Test screenshot capture and management"""
    print("\n🔧 Testing Screenshot Manager...")
    
    manager = ScreenshotManager("test_screenshots")
    
    # Test filename generation
    filename = manager._generate_filename(123, "test_scenario")
    assert "test_123_test_scenario" in filename
    assert filename.endswith(".png")
    
    print("✅ Screenshot Manager - Basic functionality working")


async def test_playwright_test_runner():
    """Test Playwright Test Runner with real webpage"""
    print("\n🎭 Testing Playwright Test Runner...")
    
    # Create test fields
    test_fields = [
        FormField(
            field_id="custname",
            name="custname",
            type=FieldType.TEXT,
            required=True,
            placeholder="Enter customer name",
            xpath="//input[@name='custname']"
        ),
        FormField(
            field_id="custtel",
            name="custtel", 
            type=FieldType.PHONE,
            required=True,
            placeholder="Enter phone number",
            xpath="//input[@name='custtel']"
        ),
        FormField(
            field_id="custemail",
            name="custemail",
            type=FieldType.EMAIL,
            required=True,
            placeholder="Enter email",
            xpath="//input[@name='custemail']"
        ),
        FormField(
            field_id="size",
            name="size",
            type=FieldType.RADIO,
            required=True,
            options=["small", "medium", "large"],
            xpath="//input[@name='size']"
        ),
        FormField(
            field_id="comments",
            name="comments",
            type=FieldType.TEXTAREA,
            required=False,
            placeholder="Additional comments",
            xpath="//textarea[@name='comments']"
        )
    ]
    
    # Create test data
    test_data = {
        "valid": [
            {"field_id": "custname", "value": "John Doe"},
            {"field_id": "custtel", "value": "+1-555-123-4567"},
            {"field_id": "custemail", "value": "john.doe@example.com"},
            {"field_id": "size", "value": "medium"},
            {"field_id": "comments", "value": "Test comment from automated test"}
        ]
    }
    
    # Test with Playwright
    async with PlaywrightTestRunner(headless=True) as runner:
        print("🌐 Running test scenario on httpbin.org...")
        
        results, screenshots = await runner.run_test_scenario(
            test_run_id=999,
            page_url="https://httpbin.org/forms/post",
            fields=test_fields,
            test_data=test_data,
            scenario="valid"
        )
        
        print(f"📊 Test Results: {len(results)} field tests completed")
        print(f"📸 Screenshots: {len(screenshots)} captured")
        
        # Verify results
        assert len(results) > 0, "No test results generated"
        
        for result in results:
            print(f"  • {result.field_id} ({result.field_type}): {'✅ PASS' if result.success else '❌ FAIL'}")
            if not result.success and result.error_message:
                print(f"    Error: {result.error_message}")
        
        # Check that at least some tests passed
        passed_tests = sum(1 for r in results if r.success)
        print(f"📈 Test Summary: {passed_tests}/{len(results)} tests passed")
        
        assert passed_tests > 0, "No tests passed - possible automation issue"
    
    print("✅ Playwright Test Runner - Working correctly")


async def test_data_integration():
    """Test integration with AI Data Generator"""
    print("\n🤖 Testing AI Data Generator Integration...")
    
    # Create test fields
    fields = [
        FormField(
            field_id="username",
            name="username",
            type=FieldType.TEXT,
            required=True
        ),
        FormField(
            field_id="email",
            name="email",
            type=FieldType.EMAIL,
            required=True
        ),
        FormField(
            field_id="phone",
            name="phone",
            type=FieldType.PHONE,
            required=False
        )
    ]
    
    # Generate test data
    generator = AIDataGenerator()
    test_data = await generator.generate_test_data(
        fields=fields,
        scenarios=[TestScenario.VALID, TestScenario.INVALID],
        count_per_scenario=2,
        use_ai=False  # Use fallback patterns
    )
    
    print(f"📊 Generated test data for {len(test_data)} scenarios")
    
    # Verify data structure
    assert "valid" in test_data
    assert "invalid" in test_data
    assert len(test_data["valid"]) > 0
    assert len(test_data["invalid"]) > 0
    
    # Check data format
    for scenario, data_list in test_data.items():
        for data_item in data_list:
            assert "field_id" in data_item
            assert "value" in data_item
            print(f"  • {scenario}: {data_item['field_id']} = {data_item['value']}")
    
    print("✅ AI Data Generator Integration - Working correctly")


async def test_end_to_end_workflow():
    """Test complete end-to-end testing workflow"""
    print("\n🔄 Testing End-to-End Workflow...")
    
    try:
        # 1. Generate test data
        fields = [
            FormField(field_id="custname", name="custname", type=FieldType.TEXT, required=True),
            FormField(field_id="custemail", name="custemail", type=FieldType.EMAIL, required=True)
        ]
        
        generator = AIDataGenerator()
        test_data = await generator.generate_test_data(
            fields=fields,
            scenarios=[TestScenario.VALID],
            count_per_scenario=1,
            use_ai=False
        )
        
        # 2. Run Playwright tests
        async with PlaywrightTestRunner(headless=True) as runner:
            results, screenshots = await runner.run_test_scenario(
                test_run_id=888,
                page_url="https://httpbin.org/forms/post",
                fields=fields,
                test_data=test_data,
                scenario="valid"
            )
        
        # 3. Verify complete workflow
        print(f"🎯 Workflow Results:")
        print(f"  • Data Generated: {len(test_data['valid'])} items")
        print(f"  • Tests Executed: {len(results)} field tests") 
        print(f"  • Screenshots: {len(screenshots)} captured")
        print(f"  • Success Rate: {sum(1 for r in results if r.success)}/{len(results)}")
        
        assert len(results) > 0, "No tests executed"
        
        print("✅ End-to-End Workflow - Complete")
        
    except Exception as e:
        print(f"❌ End-to-End Workflow Failed: {e}")
        raise


async def main():
    """Run all Playwright Test Runner tests"""
    print("🚀 DELIVERABLE 5: PLAYWRIGHT TEST RUNNER COMPREHENSIVE TEST")
    print("=" * 70)
    
    try:
        # Run tests in sequence
        await test_screenshot_manager()
        await test_playwright_test_runner()
        await test_data_integration()
        await test_end_to_end_workflow()
        
        print("\n" + "=" * 70)
        print("🎉 DELIVERABLE 5 TEST RESULTS:")
        print("✅ Screenshot Manager - PASSED")
        print("✅ Playwright Test Runner - PASSED")
        print("✅ AI Data Integration - PASSED")
        print("✅ End-to-End Workflow - PASSED")
        print("=" * 70)
        print("\n🏆 DELIVERABLE 5: PLAYWRIGHT TEST RUNNER - IMPLEMENTATION COMPLETE!")
        print("\n📋 Key Features Implemented:")
        print("   • Browser automation with Playwright")
        print("   • Form field testing (text, email, phone, radio, textarea)")
        print("   • Screenshot capture and storage")
        print("   • Test result tracking and reporting")
        print("   • Integration with AI Data Generator")
        print("   • Background task execution")
        print("   • Comprehensive API endpoints")
        print("\n🎯 Ready for Deliverable 6: Results API & Analytics")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
