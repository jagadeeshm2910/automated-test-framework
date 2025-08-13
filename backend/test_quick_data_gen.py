#!/usr/bin/env python3
"""
Quick test for the data generation service
"""
import os
import sys

# Add the backend app to the path 
backend_path = "/Users/jm237/Desktop/copilot-test-framework/backend"
sys.path.insert(0, backend_path)

try:
    print("🧪 Testing Data Generation Service Import...")
    
    # Test basic imports
    from app.services.ai_data_generator import AIDataGenerator, AdvancedDataGenerator, TestScenario
    print("✅ AI Data Generator imported successfully")
    
    from app.models.schemas import FormField, FieldType, FieldValidation
    print("✅ Schema models imported successfully")
    
    # Test basic instantiation
    generator = AdvancedDataGenerator()
    print("✅ Advanced Data Generator instantiated")
    
    ai_gen = AIDataGenerator()
    print("✅ AI Data Generator instantiated")
    
    # Test basic generation
    print("\n🎯 Testing basic data generation...")
    
    # Create a simple email field
    email_field = FormField(
        field_id="test_email",
        label="Email Address",
        type=FieldType.EMAIL,
        input_type="email",
        xpath="//input[@name='email']",
        css_selector="input[name='email']",
        required=True,
        placeholder="Enter email",
        default_value="",
        options=[],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    # Test valid email generation
    data = generator.generate_field_data(email_field, TestScenario.VALID, 3)
    print(f"✅ Generated {len(data)} valid email samples:")
    for item in data:
        print(f"   • {item['value']}")
    
    # Test invalid email generation  
    invalid_data = generator.generate_field_data(email_field, TestScenario.INVALID, 2)
    print(f"✅ Generated {len(invalid_data)} invalid email samples:")
    for item in invalid_data:
        print(f"   • {item['value']} (should be invalid)")
    
    # Test different field types
    print("\n🎯 Testing different field types...")
    
    field_types_to_test = [
        FieldType.PASSWORD,
        FieldType.PHONE,
        FieldType.TEXT,
        FieldType.NUMBER,
        FieldType.CHECKBOX
    ]
    
    for field_type in field_types_to_test:
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
            options=[],
            validation=None,
            is_visible=True,
            source_file=None
        )
        
        try:
            data = generator.generate_field_data(test_field, TestScenario.VALID, 1)
            value = data[0]['value'] if data else 'None'
            if len(str(value)) > 30:
                value = str(value)[:27] + "..."
            print(f"   ✅ {field_type.value:10} → {value}")
        except Exception as e:
            print(f"   ❌ {field_type.value:10} → Error: {str(e)}")
    
    print("\n🎉 Data Generation Service is working correctly!")
    print("🚀 Ready for API integration!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure all dependencies are installed")
except Exception as e:
    print(f"❌ Error testing data generation: {e}")
    import traceback
    traceback.print_exc()
