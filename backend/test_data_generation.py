#!/usr/bin/env python3
"""
Test the AI data generation service directly
"""
import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_data_generator import AIDataGenerator, TestScenario
from app.models.schemas import FormField, FieldType, FieldValidation


async def test_data_generation():
    """Test the data generation service"""
    print("🧪 Testing AI Data Generation Service")
    print("=" * 50)
    
    # Create test fields
    email_field = FormField(
        field_id="email",
        label="Email Address",
        type=FieldType.EMAIL,
        input_type="email",
        xpath="//input[@name='email']",
        css_selector="input[name='email']",
        required=True,
        placeholder="Enter your email",
        default_value="",
        options=[],
        validation=FieldValidation(regex=r"^[^@]+@[^@]+\.[^@]+$"),
        is_visible=True,
        source_file=None
    )
    
    password_field = FormField(
        field_id="password",
        label="Password",
        type=FieldType.PASSWORD,
        input_type="password",
        xpath="//input[@name='password']",
        css_selector="input[name='password']",
        required=True,
        placeholder="Enter password",
        default_value="",
        options=[],
        validation=FieldValidation(min_length=8, max_length=20),
        is_visible=True,
        source_file=None
    )
    
    phone_field = FormField(
        field_id="phone",
        label="Phone Number",
        type=FieldType.PHONE,
        input_type="tel",
        xpath="//input[@name='phone']",
        css_selector="input[name='phone']",
        required=False,
        placeholder="Enter phone",
        default_value="",
        options=[],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    select_field = FormField(
        field_id="country",
        label="Country",
        type=FieldType.SELECT,
        input_type="select",
        xpath="//select[@name='country']",
        css_selector="select[name='country']",
        required=True,
        placeholder="",
        default_value="",
        options=["USA", "Canada", "UK", "Australia"],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    fields = [email_field, password_field, phone_field, select_field]
    
    # Initialize AI data generator
    ai_generator = AIDataGenerator()
    
    # Test comprehensive data generation
    print("🎯 Generating comprehensive test data...")
    result = await ai_generator.generate_test_data(
        fields=fields,
        scenarios=[TestScenario.VALID, TestScenario.INVALID, TestScenario.EDGE_CASE],
        count_per_scenario=2,
        use_ai=False  # Use fallback patterns for now
    )
    
    print(f"✅ Generation completed!")
    print(f"📊 Total fields: {result['total_fields']}")
    print(f"🤖 AI used: {result['ai_used']}")
    print(f"🔧 Method: {result['method']}")
    print(f"📋 Scenarios: {', '.join(result['scenarios'])}")
    print()
    
    # Display results by scenario
    for scenario_name, scenario_data in result["test_data"].items():
        print(f"📝 Scenario: {scenario_name.upper()}")
        print(f"   Items: {len(scenario_data)}")
        
        # Group by field
        field_groups = {}
        for item in scenario_data:
            field_id = item["field_id"]
            if field_id not in field_groups:
                field_groups[field_id] = []
            field_groups[field_id].append(item)
        
        for field_id, items in field_groups.items():
            print(f"   {field_id} ({items[0]['type']}):")
            for item in items:
                value = item["value"]
                if len(str(value)) > 50:
                    value = str(value)[:47] + "..."
                print(f"     • {value}")
        print()
    
    # Test individual field generation
    print("🎯 Testing individual field generation...")
    email_data = await ai_generator.generate_field_data(
        field=email_field,
        scenario=TestScenario.VALID,
        count=3
    )
    
    print("📧 Email field data:")
    for item in email_data:
        print(f"   • {item['value']} (valid: {item['is_valid']})")
    print()
    
    # Test all field types
    print("🎯 Testing all field types...")
    for field_type in FieldType:
        if field_type in [FieldType.HIDDEN]:  # Skip some types for demo
            continue
            
        test_field = FormField(
            field_id=f"test_{field_type.value}",
            label=f"Test {field_type.value}",
            type=field_type,
            input_type=field_type.value,
            xpath="//input",
            css_selector="input",
            required=False,
            placeholder="",
            default_value="",
            options=["option1", "option2"] if field_type in [FieldType.SELECT, FieldType.RADIO] else [],
            validation=None,
            is_visible=True,
            source_file=None
        )
        
        try:
            data = await ai_generator.generate_field_data(test_field, TestScenario.VALID, 1)
            value = data[0]["value"] if data else "None"
            if len(str(value)) > 30:
                value = str(value)[:27] + "..."
            print(f"   ✅ {field_type.value:12} → {value}")
        except Exception as e:
            print(f"   ❌ {field_type.value:12} → Error: {str(e)}")
    
    print()
    print("🎉 Data generation test completed successfully!")
    print("🚀 Ready for API integration!")


if __name__ == "__main__":
    asyncio.run(test_data_generation())
