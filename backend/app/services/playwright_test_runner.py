"""
Playwright Test Runner Service
Automated UI testing with screenshot capture and result tracking
"""
import asyncio
import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import logging

from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from app.models.schemas import FormField, FieldType, TestStatus
from app.models.crud import TestRunCRUD, ScreenshotCRUD

logger = logging.getLogger(__name__)


class TestResult:
    """Individual test result for a field"""
    def __init__(self, field_id: str, field_type: str, test_value: str, success: bool, error_message: str = None):
        self.field_id = field_id
        self.field_type = field_type
        self.test_value = test_value
        self.success = success
        self.error_message = error_message
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "field_id": self.field_id,
            "field_type": self.field_type,
            "test_value": self.test_value,
            "success": self.success,
            "error_message": self.error_message,
            "timestamp": self.timestamp
        }


class ScreenshotManager:
    """Manages screenshot capture and storage"""
    
    def __init__(self, base_path: str = "screenshots"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
    
    def _generate_filename(self, test_run_id: int, screenshot_type: str, extension: str = "png") -> str:
        """Generate unique filename for screenshot"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        return f"test_{test_run_id}_{screenshot_type}_{timestamp}_{unique_id}.{extension}"
    
    async def capture_screenshot(self, page: Page, test_run_id: int, screenshot_type: str) -> str:
        """Capture and save screenshot"""
        try:
            filename = self._generate_filename(test_run_id, screenshot_type)
            file_path = self.base_path / filename
            
            await page.screenshot(path=str(file_path), full_page=True)
            
            # Get file size
            file_size = file_path.stat().st_size if file_path.exists() else 0
            
            logger.info(f"Screenshot captured: {file_path} ({file_size} bytes)")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Failed to capture screenshot: {str(e)}")
            return None


class PlaywrightTestRunner:
    """
    Main Playwright test runner for automated UI testing
    """
    
    def __init__(self, headless: bool = True, timeout: int = 30000):
        self.headless = headless
        self.timeout = timeout
        self.screenshot_manager = ScreenshotManager()
        self.browser = None
        self.context = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=self.headless,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        self.context = await self.browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()
    
    async def run_test_scenario(
        self,
        test_run_id: int,
        page_url: str,
        fields: List[FormField],
        test_data: Dict[str, Any],
        scenario: str = "valid"
    ) -> Tuple[List[TestResult], List[str]]:
        """
        Run a complete test scenario for a form
        
        Args:
            test_run_id: Database ID of the test run
            page_url: URL of the page to test
            fields: List of form fields to test
            test_data: Generated test data for the scenario
            scenario: Test scenario name (valid, invalid, etc.)
            
        Returns:
            Tuple of (test_results, screenshot_paths)
        """
        page = await self.context.new_page()
        test_results = []
        screenshot_paths = []
        
        try:
            logger.info(f"Starting test scenario '{scenario}' for {page_url}")
            
            # Navigate to the page
            await page.goto(page_url, timeout=self.timeout)
            await page.wait_for_load_state('networkidle', timeout=self.timeout)
            
            # Capture initial screenshot
            initial_screenshot = await self.screenshot_manager.capture_screenshot(
                page, test_run_id, f"{scenario}_before"
            )
            if initial_screenshot:
                screenshot_paths.append(initial_screenshot)
            
            # Get test data for this scenario
            scenario_data = test_data.get(scenario, [])
            
            # Create a mapping of field_id to test values
            field_test_data = {}
            for data_item in scenario_data:
                field_id = data_item.get("field_id")
                if field_id:
                    if field_id not in field_test_data:
                        field_test_data[field_id] = []
                    field_test_data[field_id].append(data_item["value"])
            
            # Test each field
            for field in fields:
                if field.field_id in field_test_data:
                    test_values = field_test_data[field.field_id]
                    
                    for test_value in test_values[:1]:  # Use first value for now
                        result = await self._test_field(page, field, test_value)
                        test_results.append(result)
                        
                        # Short delay between fields
                        await page.wait_for_timeout(500)
            
            # Capture final screenshot
            final_screenshot = await self.screenshot_manager.capture_screenshot(
                page, test_run_id, f"{scenario}_after"
            )
            if final_screenshot:
                screenshot_paths.append(final_screenshot)
            
            logger.info(f"Completed scenario '{scenario}': {len(test_results)} field tests")
            
        except Exception as e:
            logger.error(f"Error in test scenario '{scenario}': {str(e)}")
            
            # Capture error screenshot
            error_screenshot = await self.screenshot_manager.capture_screenshot(
                page, test_run_id, f"{scenario}_error"
            )
            if error_screenshot:
                screenshot_paths.append(error_screenshot)
            
            # Add error result
            error_result = TestResult(
                field_id="test_error",
                field_type="error",
                test_value="",
                success=False,
                error_message=str(e)
            )
            test_results.append(error_result)
            
        finally:
            await page.close()
        
        return test_results, screenshot_paths
    
    async def _test_field(self, page: Page, field: FormField, test_value: str) -> TestResult:
        """Test a single form field with a value"""
        try:
            logger.debug(f"Testing field {field.field_id} with value: {test_value}")
            
            # Find the element using XPath or CSS selector
            element = None
            
            # Try XPath first
            if field.xpath:
                try:
                    element = await page.wait_for_selector(f'xpath={field.xpath}', timeout=5000)
                except:
                    pass
            
            # Fallback to CSS selector
            if not element and field.css_selector:
                try:
                    element = await page.wait_for_selector(field.css_selector, timeout=5000)
                except:
                    pass
            
            # Fallback to name attribute
            if not element:
                try:
                    element = await page.wait_for_selector(f'[name="{field.field_id}"]', timeout=5000)
                except:
                    pass
            
            if not element:
                return TestResult(
                    field_id=field.field_id,
                    field_type=field.type.value,
                    test_value=test_value,
                    success=False,
                    error_message="Element not found"
                )
            
            # Perform field-specific action
            success = await self._fill_field(element, field, test_value)
            
            return TestResult(
                field_id=field.field_id,
                field_type=field.type.value,
                test_value=test_value,
                success=success,
                error_message=None if success else "Failed to fill field"
            )
            
        except Exception as e:
            return TestResult(
                field_id=field.field_id,
                field_type=field.type.value,
                test_value=test_value,
                success=False,
                error_message=str(e)
            )
    
    async def _fill_field(self, element, field: FormField, value: str) -> bool:
        """Fill a field based on its type"""
        try:
            if field.type in [FieldType.TEXT, FieldType.EMAIL, FieldType.PASSWORD, 
                             FieldType.PHONE, FieldType.NUMBER, FieldType.URL]:
                # Text-based fields
                await element.clear()
                await element.fill(value)
                return True
                
            elif field.type == FieldType.TEXTAREA:
                # Textarea
                await element.clear()
                await element.fill(value)
                return True
                
            elif field.type == FieldType.CHECKBOX:
                # Checkbox
                should_check = value.lower() in ['true', '1', 'yes', 'checked']
                is_checked = await element.is_checked()
                if should_check != is_checked:
                    await element.click()
                return True
                
            elif field.type == FieldType.RADIO:
                # Radio button
                if value in field.options:
                    # Find the specific radio option
                    radio_xpath = f'//input[@type="radio"][@name="{field.field_id}"][@value="{value}"]'
                    radio_element = await element.page.wait_for_selector(f'xpath={radio_xpath}', timeout=3000)
                    await radio_element.click()
                    return True
                return False
                
            elif field.type == FieldType.SELECT:
                # Select dropdown
                if value in field.options:
                    await element.select_option(value)
                    return True
                return False
                
            elif field.type in [FieldType.DATE, FieldType.TIME, FieldType.DATETIME]:
                # Date/time fields
                await element.clear()
                await element.fill(value)
                return True
                
            elif field.type == FieldType.FILE:
                # File upload
                if os.path.exists(value):
                    await element.set_input_files(value)
                    return True
                return False
                
            elif field.type == FieldType.HIDDEN:
                # Hidden fields - use JavaScript to set value
                await element.evaluate(f'element => element.value = "{value}"')
                return True
                
            else:
                # Default text handling
                await element.clear()
                await element.fill(value)
                return True
                
        except Exception as e:
            logger.warning(f"Failed to fill field {field.field_id}: {str(e)}")
            return False
    
    async def run_form_submission_test(self, page: Page, submit_selector: str = None) -> bool:
        """
        Attempt to submit the form and check for success/error indicators
        """
        try:
            # Find submit button
            submit_button = None
            
            # Try common submit selectors
            submit_selectors = [
                submit_selector,
                'input[type="submit"]',
                'button[type="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Send")',
                'input[value*="Submit"]'
            ]
            
            for selector in submit_selectors:
                if selector:
                    try:
                        submit_button = await page.wait_for_selector(selector, timeout=2000)
                        break
                    except:
                        continue
            
            if not submit_button:
                logger.warning("No submit button found")
                return False
            
            # Click submit
            await submit_button.click()
            
            # Wait for response
            await page.wait_for_timeout(2000)
            
            # Check for success/error indicators
            success_indicators = [
                'text=success',
                'text=thank you',
                'text=submitted',
                '.success',
                '.alert-success'
            ]
            
            error_indicators = [
                'text=error',
                'text=invalid',
                'text=required',
                '.error',
                '.alert-error',
                '.alert-danger'
            ]
            
            # Check for success
            for indicator in success_indicators:
                try:
                    await page.wait_for_selector(indicator, timeout=1000)
                    return True
                except:
                    continue
            
            # Check for errors
            for indicator in error_indicators:
                try:
                    await page.wait_for_selector(indicator, timeout=1000)
                    return False
                except:
                    continue
            
            # No clear indication, assume success if no errors
            return True
            
        except Exception as e:
            logger.error(f"Form submission test failed: {str(e)}")
            return False
