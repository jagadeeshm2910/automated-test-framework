# GitHub Repository Scanner - Extracts form field metadata from repository files
import asyncio
import logging
from typing import List, Dict, Any, Optional, Tuple
from urllib.parse import urlparse
from datetime import datetime
import re
import base64

import aiohttp
from lxml import html
from bs4 import BeautifulSoup

from ..models.schemas import FormField, FieldType, FieldValidation, MetadataCreate, SourceType

logger = logging.getLogger(__name__)


class GitHubScannerService:
    """
    Service for extracting form field metadata from GitHub repository files
    """
    
    def __init__(self):
        self.github_api_base = "https://api.github.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def extract_metadata_from_repository(
        self,
        repository_url: str,
        branch: str = "main",
        file_patterns: Optional[List[str]] = None
    ) -> MetadataCreate:
        """
        Extract form field metadata from GitHub repository files
        
        Args:
            repository_url: GitHub repository URL
            branch: Branch to scan (default: main)
            file_patterns: File patterns to search (default: HTML/JSX files)
            
        Returns:
            MetadataCreate: Extracted metadata from repository
        """
        logger.info(f"Starting GitHub repository scan: {repository_url}")
        
        # Parse repository info
        owner, repo = self._parse_github_url(repository_url)
        
        # Default file patterns for HTML and React components
        if not file_patterns:
            file_patterns = [
                "**/*.html", "**/*.htm", "**/*.jsx", "**/*.tsx", 
                "**/*.js", "**/*.ts", "**/*.vue", "**/*.svelte"
            ]
        
        try:
            # Get repository file tree
            files = await self._get_repository_files(owner, repo, branch, file_patterns)
            
            # Extract form fields from all matching files
            all_fields = []
            processed_files = []
            
            for file_info in files:
                try:
                    file_content = await self._get_file_content(
                        owner, repo, file_info['path'], branch
                    )
                    
                    if file_content:
                        fields = await self._extract_fields_from_file(
                            file_content, file_info['path'], repository_url
                        )
                        all_fields.extend(fields)
                        processed_files.append(file_info['path'])
                        
                except Exception as e:
                    logger.warning(f"Error processing file {file_info['path']}: {e}")
                    continue
            
            # Remove duplicate fields based on field_id
            unique_fields = self._deduplicate_fields(all_fields)
            
            # Create metadata response
            metadata = MetadataCreate(
                page_url=repository_url,
                source_type=SourceType.GITHUB_REPOSITORY,
                fields=unique_fields,
                repository_branch=branch,
                scanned_files=processed_files
            )
            
            logger.info(
                f"Successfully extracted {len(unique_fields)} form fields "
                f"from {len(processed_files)} files in {repository_url}"
            )
            return metadata
            
        except Exception as e:
            logger.error(f"Error scanning GitHub repository {repository_url}: {str(e)}")
            raise ValueError(f"Failed to scan repository: {str(e)}")
    
    def _parse_github_url(self, repository_url: str) -> Tuple[str, str]:
        """Parse GitHub URL to extract owner and repository name"""
        parsed = urlparse(repository_url)
        
        if parsed.netloc != 'github.com':
            raise ValueError("Invalid GitHub URL - must be github.com")
        
        path_parts = parsed.path.strip('/').split('/')
        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub URL - missing owner/repo")
        
        owner = path_parts[0]
        repo = path_parts[1]
        
        # Remove .git suffix if present
        if repo.endswith('.git'):
            repo = repo[:-4]
        
        return owner, repo
    
    async def _get_repository_files(
        self,
        owner: str,
        repo: str,
        branch: str,
        file_patterns: List[str]
    ) -> List[Dict[str, Any]]:
        """Get list of files in repository matching patterns"""
        
        # Get repository tree
        tree_url = f"{self.github_api_base}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        
        async with self.session.get(tree_url) as response:
            if response.status != 200:
                error_text = await response.text()
                raise ValueError(f"Failed to fetch repository tree: {error_text}")
            
            tree_data = await response.json()
        
        # Filter files based on patterns
        matching_files = []
        for item in tree_data.get('tree', []):
            if item['type'] == 'blob':  # Only files, not directories
                file_path = item['path']
                
                # Check if file matches any pattern
                if self._matches_file_patterns(file_path, file_patterns):
                    matching_files.append({
                        'path': file_path,
                        'sha': item['sha'],
                        'size': item.get('size', 0)
                    })
        
        # Limit to reasonable number of files to avoid API rate limits
        if len(matching_files) > 50:
            logger.warning(f"Found {len(matching_files)} files, limiting to first 50")
            matching_files = matching_files[:50]
        
        return matching_files
    
    def _matches_file_patterns(self, file_path: str, patterns: List[str]) -> bool:
        """Check if file path matches any of the given patterns"""
        import fnmatch
        
        for pattern in patterns:
            if fnmatch.fnmatch(file_path, pattern):
                return True
        return False
    
    async def _get_file_content(
        self,
        owner: str,
        repo: str,
        file_path: str,
        branch: str
    ) -> Optional[str]:
        """Get content of a specific file from GitHub repository"""
        
        # Use contents API to get file content
        content_url = f"{self.github_api_base}/repos/{owner}/{repo}/contents/{file_path}?ref={branch}"
        
        try:
            async with self.session.get(content_url) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch file {file_path}: {response.status}")
                    return None
                
                file_data = await response.json()
                
                # Decode base64 content
                if file_data.get('encoding') == 'base64':
                    content_bytes = base64.b64decode(file_data['content'])
                    try:
                        return content_bytes.decode('utf-8')
                    except UnicodeDecodeError:
                        logger.warning(f"Could not decode file {file_path} as UTF-8")
                        return None
                
                return file_data.get('content', '')
                
        except Exception as e:
            logger.warning(f"Error fetching file {file_path}: {e}")
            return None
    
    async def _extract_fields_from_file(
        self,
        file_content: str,
        file_path: str,
        repository_url: str
    ) -> List[FormField]:
        """Extract form fields from file content"""
        
        file_extension = file_path.split('.')[-1].lower()
        
        if file_extension in ['html', 'htm']:
            return await self._extract_from_html(file_content, file_path)
        elif file_extension in ['jsx', 'tsx', 'js', 'ts']:
            return await self._extract_from_jsx(file_content, file_path)
        elif file_extension in ['vue']:
            return await self._extract_from_vue(file_content, file_path)
        elif file_extension in ['svelte']:
            return await self._extract_from_svelte(file_content, file_path)
        else:
            # Try generic HTML extraction as fallback
            return await self._extract_from_html(file_content, file_path)
    
    async def _extract_from_html(self, content: str, file_path: str) -> List[FormField]:
        """Extract form fields from HTML content"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            fields = []
            
            # Find all form input elements
            input_elements = soup.find_all(['input', 'textarea', 'select'])
            
            for element in input_elements:
                field = self._analyze_html_element(element, file_path)
                if field:
                    fields.append(field)
            
            return fields
            
        except Exception as e:
            logger.warning(f"Error parsing HTML in {file_path}: {e}")
            return []
    
    async def _extract_from_jsx(self, content: str, file_path: str) -> List[FormField]:
        """Extract form fields from JSX/TSX content using regex patterns"""
        fields = []
        
        try:
            # JSX input patterns - looking for JSX elements with form field attributes
            jsx_patterns = [
                # Standard input elements
                r'<input\s+([^>]*?)/?>', 
                # Textarea elements
                r'<textarea\s+([^>]*?)>.*?</textarea>',
                # Select elements  
                r'<select\s+([^>]*?)>.*?</select>',
                # Self-closing variants
                r'<Input\s+([^>]*?)/?>', 
                r'<TextArea\s+([^>]*?)/?>', 
                r'<Select\s+([^>]*?)/?>'
            ]
            
            for pattern in jsx_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE | re.DOTALL)
                
                for match in matches:
                    attributes_str = match.group(1)
                    field = self._analyze_jsx_attributes(attributes_str, file_path)
                    if field:
                        fields.append(field)
            
            return fields
            
        except Exception as e:
            logger.warning(f"Error parsing JSX in {file_path}: {e}")
            return []
    
    async def _extract_from_vue(self, content: str, file_path: str) -> List[FormField]:
        """Extract form fields from Vue template content"""
        try:
            # Extract template section
            template_match = re.search(r'<template[^>]*>(.*?)</template>', content, re.DOTALL | re.IGNORECASE)
            
            if template_match:
                template_content = template_match.group(1)
                # Parse as HTML
                return await self._extract_from_html(template_content, file_path)
            
            return []
            
        except Exception as e:
            logger.warning(f"Error parsing Vue file {file_path}: {e}")
            return []
    
    async def _extract_from_svelte(self, content: str, file_path: str) -> List[FormField]:
        """Extract form fields from Svelte component content"""
        try:
            # Svelte components are similar to HTML with some enhancements
            # For simplicity, treat as HTML and extract form elements
            return await self._extract_from_html(content, file_path)
            
        except Exception as e:
            logger.warning(f"Error parsing Svelte file {file_path}: {e}")
            return []
    
    def _analyze_html_element(self, element, file_path: str) -> Optional[FormField]:
        """Analyze HTML element and create FormField"""
        try:
            tag_name = element.name
            input_type = element.get('type', 'text' if tag_name == 'input' else tag_name)
            
            # Generate field ID
            field_id = (
                element.get('id') or
                element.get('name') or
                f"{tag_name}_{hash(str(element))}"
            )
            
            # Determine field type
            field_type = self._determine_field_type_from_attributes(
                input_type, element.get('name', ''), element.get('id', '')
            )
            
            # Extract other attributes
            label = element.get('placeholder', '') or element.get('aria-label', '') or field_id
            required = element.get('required') is not None
            placeholder = element.get('placeholder', '')
            default_value = element.get('value', '')
            
            # Generate selectors
            css_selector = self._generate_css_selector_from_attributes(element)
            xpath = self._generate_xpath_from_attributes(element)
            
            # Extract validation
            validation = self._extract_validation_from_attributes(element)
            
            # Extract options for select elements
            options = []
            if tag_name == 'select':
                option_elements = element.find_all('option')
                options = [opt.get('value', opt.get_text(strip=True)) for opt in option_elements]
            
            return FormField(
                field_id=field_id,
                label=label,
                type=field_type,
                input_type=input_type,
                xpath=xpath,
                css_selector=css_selector,
                required=required,
                placeholder=placeholder,
                default_value=default_value,
                options=options,
                validation=validation,
                is_visible=True,  # Assume visible in static analysis
                source_file=file_path
            )
            
        except Exception as e:
            logger.warning(f"Error analyzing element in {file_path}: {e}")
            return None
    
    def _analyze_jsx_attributes(self, attributes_str: str, file_path: str) -> Optional[FormField]:
        """Analyze JSX attributes string and create FormField"""
        try:
            # Parse JSX attributes using regex
            attr_pattern = r'(\w+)=\{?"?([^"}\s]+)"?\}?'
            attributes = {}
            
            for match in re.finditer(attr_pattern, attributes_str):
                attr_name = match.group(1)
                attr_value = match.group(2)
                
                # Clean up JSX expressions
                if attr_value.startswith('{') and attr_value.endswith('}'):
                    attr_value = attr_value[1:-1]
                
                attributes[attr_name] = attr_value
            
            # Generate field ID
            field_id = (
                attributes.get('id') or
                attributes.get('name') or
                f"jsx_{hash(attributes_str)}"
            )
            
            input_type = attributes.get('type', 'text')
            
            # Determine field type
            field_type = self._determine_field_type_from_attributes(
                input_type, attributes.get('name', ''), attributes.get('id', '')
            )
            
            # Extract other attributes
            label = (
                attributes.get('placeholder', '') or 
                attributes.get('aria-label', '') or 
                field_id
            )
            required = 'required' in attributes
            placeholder = attributes.get('placeholder', '')
            default_value = attributes.get('value', '') or attributes.get('defaultValue', '')
            
            # Generate selectors (simplified for JSX)
            css_selector = f"[name='{attributes.get('name')}']" if attributes.get('name') else f"#{field_id}"
            xpath = f"//*[@name='{attributes.get('name')}']" if attributes.get('name') else f"//*[@id='{field_id}']"
            
            return FormField(
                field_id=field_id,
                label=label,
                type=field_type,
                input_type=input_type,
                xpath=xpath,
                css_selector=css_selector,
                required=required,
                placeholder=placeholder,
                default_value=default_value,
                options=[],
                validation=None,
                is_visible=True,
                source_file=file_path
            )
            
        except Exception as e:
            logger.warning(f"Error analyzing JSX attributes in {file_path}: {e}")
            return None
    
    def _determine_field_type_from_attributes(
        self, 
        input_type: str, 
        name: str, 
        element_id: str
    ) -> FieldType:
        """Determine field type from element attributes"""
        
        input_type = input_type.lower()
        name_lower = name.lower()
        id_lower = element_id.lower()
        
        # Direct type mappings
        type_mappings = {
            'email': FieldType.EMAIL,
            'password': FieldType.PASSWORD,
            'tel': FieldType.PHONE,
            'url': FieldType.URL,
            'date': FieldType.DATE,
            'datetime-local': FieldType.DATETIME,
            'time': FieldType.TIME,
            'number': FieldType.NUMBER,
            'file': FieldType.FILE,
            'checkbox': FieldType.CHECKBOX,
            'radio': FieldType.RADIO,
            'hidden': FieldType.HIDDEN,
            'textarea': FieldType.TEXTAREA,
            'select': FieldType.SELECT
        }
        
        if input_type in type_mappings:
            return type_mappings[input_type]
        
        # Semantic analysis
        # Email patterns
        if any(pattern in name_lower or pattern in id_lower 
               for pattern in ['email', 'mail']):
            return FieldType.EMAIL
        
        # Password patterns
        if any(pattern in name_lower or pattern in id_lower 
               for pattern in ['password', 'pwd']):
            return FieldType.PASSWORD
        
        # Phone patterns
        if any(pattern in name_lower or pattern in id_lower 
               for pattern in ['phone', 'tel', 'mobile']):
            return FieldType.PHONE
        
        return FieldType.TEXT
    
    def _generate_css_selector_from_attributes(self, element) -> str:
        """Generate CSS selector from element attributes"""
        if element.get('id'):
            return f"#{element['id']}"
        elif element.get('name'):
            return f"[name='{element['name']}']"
        else:
            return element.name
    
    def _generate_xpath_from_attributes(self, element) -> str:
        """Generate XPath from element attributes"""
        if element.get('id'):
            return f"//*[@id='{element['id']}']"
        elif element.get('name'):
            return f"//*[@name='{element['name']}']"
        else:
            return f"//{element.name}"
    
    def _extract_validation_from_attributes(self, element) -> Optional[FieldValidation]:
        """Extract validation rules from element attributes"""
        validation_data = {}
        
        if element.get('required') is not None:
            validation_data['required'] = True
        
        if element.get('minlength'):
            validation_data['min_length'] = int(element['minlength'])
        
        if element.get('maxlength'):
            validation_data['max_length'] = int(element['maxlength'])
        
        if element.get('pattern'):
            validation_data['regex'] = element['pattern']
        
        return FieldValidation(**validation_data) if validation_data else None
    
    def _deduplicate_fields(self, fields: List[FormField]) -> List[FormField]:
        """Remove duplicate fields based on field_id"""
        unique_fields = {}
        for field in fields:
            if field.field_id not in unique_fields:
                unique_fields[field.field_id] = field
        return list(unique_fields.values())


class GitHubScannerError(Exception):
    """Custom exception for GitHub scanner errors"""
    pass
