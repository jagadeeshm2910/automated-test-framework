"""
AI-powered test data generator with intelligent fallback
Generates realistic test data based on field metadata
"""
import asyncio
import re
import random
import string
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
import logging

from app.models.schemas import FormField, FieldType, FieldValidation

logger = logging.getLogger(__name__)


class TestScenario(str, Enum):
    VALID = "valid"
    INVALID = "invalid"
    EDGE_CASE = "edge_case"
    BOUNDARY = "boundary"


class DataGenerationMethod(str, Enum):
    AI = "ai"
    PATTERN = "pattern"
    RANDOM = "random"
    TEMPLATE = "template"


class AdvancedDataGenerator:
    """
    Advanced pattern-based data generator with realistic outputs
    Serves as fallback when AI is unavailable
    """
    
    def __init__(self):
        self.domains = [
            "example.com", "test.org", "demo.net", "sample.io", 
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"
        ]
        
        self.first_names = [
            "James", "Mary", "John", "Patricia", "Robert", "Jennifer", 
            "Michael", "Linda", "David", "Elizabeth", "William", "Barbara",
            "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
            "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa"
        ]
        
        self.last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
            "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
            "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore"
        ]
        
        self.cities = [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
            "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
            "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte"
        ]
        
        self.states = [
            "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
            "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
            "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ"
        ]

    def generate_field_data(
        self, 
        field: FormField, 
        scenario: TestScenario = TestScenario.VALID,
        count: int = 1
    ) -> List[Dict[str, Any]]:
        """Generate test data for a specific field"""
        try:
            data_list = []
            for _ in range(count):
                data = {
                    "field_id": field.field_id,
                    "label": field.label,
                    "type": field.type,
                    "scenario": scenario.value,
                    "method": DataGenerationMethod.PATTERN.value,
                    "generated_at": datetime.utcnow().isoformat(),
                    "value": None,
                    "is_valid": scenario == TestScenario.VALID
                }
                
                # Generate value based on field type and scenario
                data["value"] = self._generate_value_by_type(field, scenario)
                data_list.append(data)
            
            return data_list
            
        except Exception as e:
            logger.error(f"Error generating data for field {field.field_id}: {str(e)}")
            return []

    def _generate_value_by_type(self, field: FormField, scenario: TestScenario) -> str:
        """Generate value based on field type and scenario"""
        
        if field.type == FieldType.EMAIL:
            return self._generate_email(scenario, field.validation)
            
        elif field.type == FieldType.PASSWORD:
            return self._generate_password(scenario, field.validation)
            
        elif field.type == FieldType.PHONE:
            return self._generate_phone(scenario)
            
        elif field.type == FieldType.TEXT:
            return self._generate_text(scenario, field)
            
        elif field.type == FieldType.NUMBER:
            return self._generate_number(scenario, field.validation)
            
        elif field.type == FieldType.DATE:
            return self._generate_date(scenario)
            
        elif field.type == FieldType.TIME:
            return self._generate_time(scenario)
            
        elif field.type == FieldType.DATETIME:
            return self._generate_datetime(scenario)
            
        elif field.type == FieldType.URL:
            return self._generate_url(scenario)
            
        elif field.type == FieldType.CHECKBOX:
            return self._generate_checkbox(scenario)
            
        elif field.type == FieldType.RADIO:
            return self._generate_radio(scenario, field.options)
            
        elif field.type == FieldType.SELECT:
            return self._generate_select(scenario, field.options)
            
        elif field.type == FieldType.TEXTAREA:
            return self._generate_textarea(scenario, field.validation)
            
        elif field.type == FieldType.FILE:
            return self._generate_file(scenario)
            
        else:
            # Default to text generation
            return self._generate_text(scenario, field)

    def _generate_email(self, scenario: TestScenario, validation: Optional[FieldValidation] = None) -> str:
        """Generate email addresses"""
        if scenario == TestScenario.VALID:
            name = random.choice(self.first_names).lower()
            surname = random.choice(self.last_names).lower()
            domain = random.choice(self.domains)
            return f"{name}.{surname}@{domain}"
            
        elif scenario == TestScenario.INVALID:
            invalid_patterns = [
                "invalid.email",  # Missing @
                "@domain.com",   # Missing local part
                "user@",         # Missing domain
                "user@domain",   # Missing TLD
                "user name@domain.com",  # Space in local part
                "user@domain..com"       # Double dot
            ]
            return random.choice(invalid_patterns)
            
        elif scenario == TestScenario.EDGE_CASE:
            edge_cases = [
                "a@b.co",  # Minimal valid
                "very.long.email.address.that.is.still.valid@extremely.long.domain.name.example.com",
                "user+tag@domain.com",  # With tag
                "user.123@domain-with-hyphens.org"
            ]
            return random.choice(edge_cases)
            
        else:  # BOUNDARY
            return "x" * 50 + "@" + "y" * 50 + ".com"

    def _generate_password(self, scenario: TestScenario, validation: Optional[FieldValidation] = None) -> str:
        """Generate passwords"""
        min_length = validation.min_length if validation and validation.min_length else 8
        max_length = validation.max_length if validation and validation.max_length else 20
        
        if scenario == TestScenario.VALID:
            length = random.randint(min_length, max_length)
            chars = string.ascii_letters + string.digits + "!@#$%^&*"
            password = ''.join(random.choice(chars) for _ in range(length))
            # Ensure it has at least one of each type
            password = password[:length-4] + "A1!a"
            return password
            
        elif scenario == TestScenario.INVALID:
            if min_length > 1:
                return "x" * (min_length - 1)  # Too short
            else:
                return ""
                
        elif scenario == TestScenario.EDGE_CASE:
            return "x" * min_length  # Exactly minimum length
            
        else:  # BOUNDARY
            return "x" * max_length if max_length else "x" * 100

    def _generate_phone(self, scenario: TestScenario) -> str:
        """Generate phone numbers"""
        if scenario == TestScenario.VALID:
            formats = [
                "(555) 123-4567",
                "555-123-4567", 
                "555.123.4567",
                "+1 555 123 4567",
                "5551234567"
            ]
            return random.choice(formats)
            
        elif scenario == TestScenario.INVALID:
            invalid_patterns = [
                "123",  # Too short
                "abc-def-ghij",  # Letters
                "555-123-456",   # Wrong format
                "(555) 123-456"  # Incomplete
            ]
            return random.choice(invalid_patterns)
            
        else:
            return "+1 (555) 123-4567"  # Standard format

    def _generate_text(self, scenario: TestScenario, field: FormField) -> str:
        """Generate text based on field context"""
        # Analyze field label/id for context
        field_context = (field.label + " " + field.field_id).lower()
        
        if any(word in field_context for word in ["name", "first", "given"]):
            return self._generate_name(scenario, "first")
        elif any(word in field_context for word in ["last", "family", "surname"]):
            return self._generate_name(scenario, "last")
        elif any(word in field_context for word in ["city", "town"]):
            return random.choice(self.cities)
        elif any(word in field_context for word in ["state", "province"]):
            return random.choice(self.states)
        elif any(word in field_context for word in ["address", "street"]):
            return f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Park', 'First'])} St"
        elif any(word in field_context for word in ["zip", "postal"]):
            return f"{random.randint(10000, 99999)}"
        elif any(word in field_context for word in ["company", "organization"]):
            companies = ["Tech Corp", "Data Systems", "Web Solutions", "Digital Inc"]
            return random.choice(companies)
        else:
            # Generic text
            if scenario == TestScenario.VALID:
                return f"Sample text {random.randint(1, 1000)}"
            elif scenario == TestScenario.INVALID:
                return ""  # Empty
            else:
                return "A" * 100  # Very long

    def _generate_name(self, scenario: TestScenario, name_type: str) -> str:
        """Generate first or last names"""
        if name_type == "first":
            names = self.first_names
        else:
            names = self.last_names
            
        if scenario == TestScenario.VALID:
            return random.choice(names)
        elif scenario == TestScenario.INVALID:
            return "123"  # Numbers as name
        else:
            return random.choice(names)

    def _generate_number(self, scenario: TestScenario, validation: Optional[FieldValidation] = None) -> str:
        """Generate numbers"""
        min_val = validation.min_value if validation and validation.min_value else 0
        max_val = validation.max_value if validation and validation.max_value else 1000
        
        if scenario == TestScenario.VALID:
            return str(random.randint(int(min_val), int(max_val)))
        elif scenario == TestScenario.INVALID:
            return "not_a_number"
        elif scenario == TestScenario.EDGE_CASE:
            return str(min_val)
        else:  # BOUNDARY
            return str(max_val)

    def _generate_date(self, scenario: TestScenario) -> str:
        """Generate dates"""
        if scenario == TestScenario.VALID:
            today = datetime.now()
            random_days = random.randint(-365, 365)
            date = today + timedelta(days=random_days)
            return date.strftime("%Y-%m-%d")
        elif scenario == TestScenario.INVALID:
            return "2023-13-45"  # Invalid month/day
        else:
            return "1900-01-01"  # Edge case

    def _generate_time(self, scenario: TestScenario) -> str:
        """Generate times"""
        if scenario == TestScenario.VALID:
            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            return f"{hour:02d}:{minute:02d}"
        elif scenario == TestScenario.INVALID:
            return "25:70"  # Invalid hour/minute
        else:
            return "00:00"

    def _generate_datetime(self, scenario: TestScenario) -> str:
        """Generate datetime"""
        date_part = self._generate_date(scenario)
        time_part = self._generate_time(scenario)
        return f"{date_part}T{time_part}"

    def _generate_url(self, scenario: TestScenario) -> str:
        """Generate URLs"""
        if scenario == TestScenario.VALID:
            domains = ["example.com", "test.org", "demo.net"]
            return f"https://www.{random.choice(domains)}/page"
        elif scenario == TestScenario.INVALID:
            return "not-a-url"
        else:
            return "https://example.com"

    def _generate_checkbox(self, scenario: TestScenario) -> str:
        """Generate checkbox values"""
        return str(random.choice([True, False])).lower()

    def _generate_radio(self, scenario: TestScenario, options: List[str]) -> str:
        """Generate radio button values"""
        if options and scenario == TestScenario.VALID:
            return random.choice(options)
        elif scenario == TestScenario.INVALID:
            return "invalid_option"
        else:
            return options[0] if options else "option1"

    def _generate_select(self, scenario: TestScenario, options: List[str]) -> str:
        """Generate select dropdown values"""
        return self._generate_radio(scenario, options)

    def _generate_textarea(self, scenario: TestScenario, validation: Optional[FieldValidation] = None) -> str:
        """Generate textarea content"""
        if scenario == TestScenario.VALID:
            return "This is a sample textarea content with multiple lines.\nIt contains realistic text for testing purposes."
        elif scenario == TestScenario.INVALID:
            return ""
        else:
            return "A" * 500  # Very long text

    def _generate_file(self, scenario: TestScenario) -> str:
        """Generate file paths/names"""
        if scenario == TestScenario.VALID:
            extensions = [".jpg", ".png", ".pdf", ".txt", ".doc"]
            return f"sample_file{random.choice(extensions)}"
        elif scenario == TestScenario.INVALID:
            return "file_without_extension"
        else:
            return "test.txt"


class AIDataGenerator:
    """
    Main AI data generator with LLaMA integration and fallback
    """
    
    def __init__(self):
        self.fallback_generator = AdvancedDataGenerator()
        self.ai_available = False  # Will be set based on LLaMA availability
        
    async def generate_test_data(
        self,
        fields: List[FormField],
        scenarios: List[TestScenario] = None,
        count_per_scenario: int = 3,
        use_ai: bool = True
    ) -> Dict[str, Any]:
        """
        Generate comprehensive test data for a list of form fields
        """
        if scenarios is None:
            scenarios = [TestScenario.VALID, TestScenario.INVALID, TestScenario.EDGE_CASE]
            
        result = {
            "generation_timestamp": datetime.utcnow().isoformat(),
            "ai_used": False,  # Will be updated when AI is implemented
            "method": DataGenerationMethod.PATTERN.value,
            "total_fields": len(fields),
            "scenarios": [s.value for s in scenarios],
            "test_data": {}
        }
        
        for scenario in scenarios:
            scenario_data = []
            
            for field in fields:
                field_data = self.fallback_generator.generate_field_data(
                    field, scenario, count_per_scenario
                )
                scenario_data.extend(field_data)
            
            result["test_data"][scenario.value] = scenario_data
        
        logger.info(f"Generated test data for {len(fields)} fields across {len(scenarios)} scenarios")
        return result
    
    async def generate_field_data(
        self,
        field: FormField,
        scenario: TestScenario = TestScenario.VALID,
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """Generate data for a single field"""
        return self.fallback_generator.generate_field_data(field, scenario, count)
