# Web Scraper Service - Extracts form field metadata from web pages
import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from urllib.parse import urlparse, urljoin
from datetime import datetime
import json

from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PlaywrightTimeoutError
from lxml import html, etree
from bs4 import BeautifulSoup
import re

from ..models.schemas import FormField, FieldType, FieldValidation, MetadataCreate, SourceType

logger = logging.getLogger(__name__)


class WebScraperService:
    """
    Service for extracting form field metadata from web pages using Playwright + lxml
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.playwright = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    async def extract_metadata_from_url(
        self, 
        url: str, 
        wait_for_js: bool = True, 
        timeout: int = 15
    ) -> MetadataCreate:
        """
        Extract form field metadata from a web page
        
        Args:
            url: The URL to scrape
            wait_for_js: Whether to wait for JavaScript to load
            timeout: Timeout in seconds (default 15)
            
        Returns:
            MetadataCreate: Extracted metadata
        """
        logger.info(f"Starting metadata extraction for URL: {url} (timeout: {timeout}s, js: {wait_for_js})")
        
        try:
            # Create new page
            page = await self.browser.new_page()
            
            # Set timeout (convert to milliseconds)
            page.set_default_timeout(timeout * 1000)
            page.set_default_navigation_timeout(timeout * 1000)
            
            # Navigate to page with appropriate wait strategy
            wait_until = 'networkidle' if wait_for_js else 'domcontentloaded'
            logger.info(f"Navigating to {url} with wait_until={wait_until}")
            
            await page.goto(url, wait_until=wait_until, timeout=timeout * 1000)
            
            # Wait for any dynamic content to load (but only briefly)
            if wait_for_js:
                await page.wait_for_timeout(min(2000, timeout * 1000 // 4))  # Max 2s or 1/4 of timeout
            
            # Get page content
            logger.info(f"Extracting content from {url}")
            html_content = await page.content()
            page_title = await page.title()
            
            # Extract form fields using multiple methods
            fields = await self._extract_form_fields(html_content, page, url)
            
            await page.close()
            
            # Create metadata response
            metadata = MetadataCreate(
                page_url=url,
                source_type=SourceType.WEB_PAGE,
                fields=fields,
                page_title=page_title
            )
            
            logger.info(f"Successfully extracted {len(fields)} form fields from {url}")
            return metadata
            
        except PlaywrightTimeoutError as e:
            logger.error(f"Timeout while loading page: {url} - {str(e)}")
            raise ValueError(f"Page load timeout ({timeout}s) for URL: {url}. Try with a longer timeout or without JavaScript waiting.")
        except Exception as e:
            logger.error(f"Error extracting metadata from {url}: {str(e)}")
            raise ValueError(f"Failed to extract metadata from {url}: {str(e)}")
            raise ValueError(f"Failed to extract metadata: {str(e)}")
    
    async def _extract_form_fields(
        self, 
        html_content: str, 
        page: Page, 
        base_url: str
    ) -> List[FormField]:
        """
        Extract form fields using lxml + BeautifulSoup + Playwright interaction
        
        Args:
            html_content: Raw HTML content
            page: Playwright page instance
            base_url: Base URL for resolving relative paths
            
        Returns:
            List[FormField]: Extracted form fields
        """
        fields = []
        
        # Parse HTML with lxml for XPath support
        tree = html.fromstring(html_content)
        
        # Parse with BeautifulSoup for easier navigation
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Define field selectors - covering common form input patterns
        input_selectors = [
            'input[type="text"]',
            'input[type="email"]', 
            'input[type="password"]',
            'input[type="tel"]',
            'input[type="url"]',
            'input[type="search"]',
            'input[type="number"]',
            'input[type="date"]',
            'input[type="datetime-local"]',
            'input[type="time"]',
            'input[type="month"]',
            'input[type="week"]',
            'input[type="color"]',
            'input[type="range"]',
            'input[type="file"]',
            'input[type="hidden"]',
            'input[type="checkbox"]',
            'input[type="radio"]',
            'textarea',
            'select'
        ]
        
        # Extract fields using CSS selectors
        for selector in input_selectors:
            elements = soup.select(selector)
            for element in elements:
                try:
                    field = await self._analyze_form_field(element, tree, page, base_url)
                    if field:
                        fields.append(field)
                except Exception as e:
                    logger.warning(f"Error analyzing field: {e}")
                    continue
        
        # Remove duplicates based on field_id
        unique_fields = {}
        for field in fields:
            if field.field_id not in unique_fields:
                unique_fields[field.field_id] = field
        
        return list(unique_fields.values())
    
    async def _analyze_form_field(
        self, 
        element, 
        tree, 
        page: Page, 
        base_url: str
    ) -> Optional[FormField]:
        """
        Analyze a single form field element and extract metadata
        
        Args:
            element: BeautifulSoup element
            tree: lxml tree for XPath generation
            page: Playwright page for interaction testing
            base_url: Base URL for context
            
        Returns:
            FormField: Analyzed field metadata or None if invalid
        """
        # Get basic attributes
        tag_name = element.name
        input_type = element.get('type', 'text' if tag_name == 'input' else tag_name)
        
        # Generate unique field ID
        field_id = (
            element.get('id') or 
            element.get('name') or 
            element.get('data-testid') or
            f"{tag_name}_{hash(str(element))}"
        )
        
        # Skip if no meaningful identifier
        if not field_id or field_id.startswith(tag_name + '_-'):
            return None
        
        # Get label text
        label = await self._extract_field_label(element, tree)
        
        # Generate selectors
        css_selector = self._generate_css_selector(element)
        xpath = self._generate_xpath(element, tree)
        
        # Determine field type
        field_type = self._determine_field_type(element, input_type, label)
        
        # Extract validation rules
        validation = self._extract_validation_rules(element)
        
        # Get other attributes
        required = element.get('required') is not None or 'required' in element.get('class', [])
        placeholder = element.get('placeholder', '')
        default_value = element.get('value', '')
        
        # Get options for select/radio/checkbox groups
        options = self._extract_field_options(element)
        
        # Test field interactivity
        is_visible = await self._test_field_visibility(page, css_selector)
        
        return FormField(
            field_id=field_id,
            label=label or field_id,
            type=field_type,
            input_type=input_type,
            xpath=xpath,
            css_selector=css_selector,
            required=required,
            placeholder=placeholder,
            default_value=default_value,
            options=options,
            validation=validation,
            is_visible=is_visible
        )
    
    async def _extract_field_label(self, element, tree) -> str:
        """Extract label text for a form field"""
        # Method 1: Direct label element
        field_id = element.get('id')
        if field_id:
            label_element = element.find_parent().find('label', {'for': field_id})
            if label_element:
                return label_element.get_text(strip=True)
        
        # Method 2: Parent label
        parent_label = element.find_parent('label')
        if parent_label:
            return parent_label.get_text(strip=True)
        
        # Method 3: Preceding sibling label
        for sibling in element.find_previous_siblings():
            if sibling.name == 'label':
                return sibling.get_text(strip=True)
            if sibling.get_text(strip=True):
                break
        
        # Method 4: aria-label or title attribute
        aria_label = element.get('aria-label')
        if aria_label:
            return aria_label
            
        title = element.get('title')
        if title:
            return title
        
        # Method 5: Placeholder as fallback
        placeholder = element.get('placeholder')
        if placeholder:
            return placeholder
            
        # Method 6: Name attribute cleanup
        name = element.get('name', '')
        if name:
            return name.replace('_', ' ').replace('-', ' ').title()
        
        return ''
    
    def _generate_css_selector(self, element) -> str:
        """Generate CSS selector for element"""
        selectors = []
        
        # ID selector (most specific)
        if element.get('id'):
            return f"#{element['id']}"
        
        # Name selector
        if element.get('name'):
            selectors.append(f"[name='{element['name']}']")
        
        # Type and tag
        tag = element.name
        input_type = element.get('type')
        if input_type:
            selectors.append(f"{tag}[type='{input_type}']")
        else:
            selectors.append(tag)
        
        # Class-based selector
        classes = element.get('class', [])
        if classes:
            class_selector = '.' + '.'.join(classes[:2])  # Limit to first 2 classes
            selectors.append(f"{tag}{class_selector}")
        
        # Return most specific available selector
        return selectors[0] if selectors else tag
    
    def _generate_xpath(self, element, tree) -> str:
        """Generate XPath for element using lxml"""
        try:
            # Find element in lxml tree
            element_id = element.get('id')
            element_name = element.get('name')
            
            if element_id:
                xpath_elements = tree.xpath(f"//*[@id='{element_id}']")
            elif element_name:
                xpath_elements = tree.xpath(f"//*[@name='{element_name}']")
            else:
                # Fallback to tag and position
                tag = element.name
                xpath_elements = tree.xpath(f"//{tag}")
            
            if xpath_elements:
                # Use lxml's getpath for precise XPath
                return tree.getpath(xpath_elements[0])
            
            # Fallback XPath
            tag = element.name
            return f"//{tag}[@name='{element.get('name', '')}']"
            
        except Exception:
            # Ultimate fallback
            return f"//{element.name}"
    
    def _determine_field_type(self, element, input_type: str, label: str) -> FieldType:
        """Determine semantic field type based on element analysis"""
        input_type = input_type.lower()
        label_lower = label.lower()
        
        # Direct type mapping
        type_mappings = {
            'email': FieldType.EMAIL,
            'password': FieldType.PASSWORD,
            'tel': FieldType.PHONE,
            'url': FieldType.URL,
            'date': FieldType.DATE,
            'datetime-local': FieldType.DATETIME,
            'time': FieldType.TIME,
            'number': FieldType.NUMBER,
            'range': FieldType.NUMBER,
            'file': FieldType.FILE,
            'checkbox': FieldType.CHECKBOX,
            'radio': FieldType.RADIO,
            'hidden': FieldType.HIDDEN,
            'color': FieldType.TEXT,
            'month': FieldType.DATE,
            'week': FieldType.DATE,
            'search': FieldType.TEXT
        }
        
        if input_type in type_mappings:
            return type_mappings[input_type]
        
        # Select and textarea
        if element.name == 'select':
            return FieldType.SELECT
        elif element.name == 'textarea':
            return FieldType.TEXTAREA
        
        # Semantic analysis based on label/name/id
        name_attr = element.get('name', '').lower()
        id_attr = element.get('id', '').lower()
        
        # Email patterns
        email_patterns = ['email', 'e-mail', '@', 'mail']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in email_patterns):
            return FieldType.EMAIL
        
        # Password patterns
        password_patterns = ['password', 'pwd', 'pass']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in password_patterns):
            return FieldType.PASSWORD
        
        # Phone patterns
        phone_patterns = ['phone', 'tel', 'mobile', 'cell']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in phone_patterns):
            return FieldType.PHONE
        
        # URL patterns  
        url_patterns = ['url', 'website', 'link', 'http']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in url_patterns):
            return FieldType.URL
        
        # Date patterns
        date_patterns = ['date', 'birth', 'dob', 'born']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in date_patterns):
            return FieldType.DATE
        
        # Number patterns
        number_patterns = ['age', 'count', 'amount', 'price', 'quantity', 'number', 'num']
        if any(pattern in label_lower or pattern in name_attr or pattern in id_attr 
               for pattern in number_patterns):
            return FieldType.NUMBER
        
        # Default to text
        return FieldType.TEXT
    
    def _extract_validation_rules(self, element) -> Optional[FieldValidation]:
        """Extract validation rules from element attributes"""
        validation_data = {}
        
        # Required
        if element.get('required') is not None:
            validation_data['required'] = True
        
        # Length constraints
        min_length = element.get('minlength')
        if min_length:
            validation_data['min_length'] = int(min_length)
            
        max_length = element.get('maxlength')
        if max_length:
            validation_data['max_length'] = int(max_length)
        
        # Number constraints
        min_val = element.get('min')
        if min_val:
            validation_data['min_value'] = float(min_val)
            
        max_val = element.get('max')
        if max_val:
            validation_data['max_value'] = float(max_val)
        
        # Pattern validation
        pattern = element.get('pattern')
        if pattern:
            validation_data['regex'] = pattern
        
        # Email validation (built-in)
        if element.get('type') == 'email':
            validation_data['regex'] = r'^[^@]+@[^@]+\.[^@]+$'
        
        # URL validation (built-in)
        if element.get('type') == 'url':
            validation_data['regex'] = r'^https?://[^\s/$.?#].[^\s]*$'
        
        return FieldValidation(**validation_data) if validation_data else None
    
    def _extract_field_options(self, element) -> List[str]:
        """Extract options for select, radio, and checkbox groups"""
        options = []
        
        if element.name == 'select':
            # Get option elements
            option_elements = element.find_all('option')
            for option in option_elements:
                value = option.get('value')
                text = option.get_text(strip=True)
                # Use text if value is empty, otherwise use value
                option_value = value if value else text
                if option_value:
                    options.append(option_value)
        
        elif element.get('type') in ['radio', 'checkbox']:
            # For radio/checkbox, find all elements with same name
            name = element.get('name')
            if name:
                # This is simplified - in a real implementation, you'd search
                # the entire form for elements with the same name
                value = element.get('value')
                if value:
                    options.append(value)
        
        return options
    
    async def _test_field_visibility(self, page: Page, css_selector: str) -> bool:
        """Test if a field is visible and interactable"""
        try:
            # Check if element exists and is visible
            await page.wait_for_selector(css_selector, timeout=1000)
            is_visible = await page.is_visible(css_selector)
            return is_visible
        except:
            return False


class WebScraperError(Exception):
    """Custom exception for web scraper errors"""
    pass
