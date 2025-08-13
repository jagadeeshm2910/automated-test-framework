"""
Test AI data generation service
"""
import pytest
import asyncio
from app.services.ai_data_generator import AIDataGenerator, AdvancedDataGenerator, TestScenario
from app.models.schemas import FormField, FieldType, FieldValidation


@pytest.fixture
def data_generator():
    """Create data generator instance"""
    return AdvancedDataGenerator()


@pytest.fixture
def ai_data_generator():
    """Create AI data generator instance"""
    return AIDataGenerator()


@pytest.fixture
def sample_email_field():
    """Sample email field for testing"""
    return FormField(
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


@pytest.fixture
def sample_password_field():
    """Sample password field for testing"""
    return FormField(
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


def test_generate_email_valid(data_generator, sample_email_field):
    """Test valid email generation"""
    data = data_generator.generate_field_data(sample_email_field, TestScenario.VALID, 5)
    
    assert len(data) == 5
    for item in data:
        assert item["field_id"] == "email"
        assert item["type"] == FieldType.EMAIL
        assert item["scenario"] == "valid"
        assert item["is_valid"] is True
        assert "@" in item["value"]
        assert "." in item["value"]


def test_generate_email_invalid(data_generator, sample_email_field):
    """Test invalid email generation"""
    data = data_generator.generate_field_data(sample_email_field, TestScenario.INVALID, 3)
    
    assert len(data) == 3
    for item in data:
        assert item["field_id"] == "email"
        assert item["scenario"] == "invalid"
        assert item["is_valid"] is False
        # Invalid emails should not have proper format
        value = item["value"]
        invalid_patterns = [
            "@" not in value,  # No @ symbol
            value.startswith("@"),  # Starts with @
            value.endswith("@"),  # Ends with @
            ".." in value,  # Double dots
            " " in value  # Spaces
        ]
        assert any(invalid_patterns), f"Expected invalid email but got: {value}"


def test_generate_password_valid(data_generator, sample_password_field):
    """Test valid password generation"""
    data = data_generator.generate_field_data(sample_password_field, TestScenario.VALID, 3)
    
    assert len(data) == 3
    for item in data:
        assert item["field_id"] == "password"
        assert item["scenario"] == "valid"
        assert item["is_valid"] is True
        assert len(item["value"]) >= 8  # Meets minimum length


def test_generate_password_invalid(data_generator, sample_password_field):
    """Test invalid password generation"""
    data = data_generator.generate_field_data(sample_password_field, TestScenario.INVALID, 3)
    
    assert len(data) == 3
    for item in data:
        assert item["field_id"] == "password"
        assert item["scenario"] == "invalid"
        assert item["is_valid"] is False
        # Should be too short
        assert len(item["value"]) < 8


def test_generate_phone_number(data_generator):
    """Test phone number generation"""
    phone_field = FormField(
        field_id="phone",
        label="Phone Number",
        type=FieldType.PHONE,
        input_type="tel",
        xpath="//input[@name='phone']",
        css_selector="input[name='phone']",
        required=False,
        placeholder="",
        default_value="",
        options=[],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    data = data_generator.generate_field_data(phone_field, TestScenario.VALID, 5)
    
    assert len(data) == 5
    for item in data:
        assert item["field_id"] == "phone"
        assert item["scenario"] == "valid"
        # Valid phone should have digits and possibly formatting
        value = item["value"]
        has_digits = any(c.isdigit() for c in value)
        assert has_digits, f"Phone number should contain digits: {value}"


def test_generate_text_field_context(data_generator):
    """Test context-aware text generation"""
    name_field = FormField(
        field_id="first_name",
        label="First Name",
        type=FieldType.TEXT,
        input_type="text",
        xpath="//input[@name='first_name']",
        css_selector="input[name='first_name']",
        required=True,
        placeholder="",
        default_value="",
        options=[],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    data = data_generator.generate_field_data(name_field, TestScenario.VALID, 3)
    
    assert len(data) == 3
    for item in data:
        assert item["field_id"] == "first_name"
        assert item["scenario"] == "valid"
        # Should generate name-like values
        value = item["value"]
        assert isinstance(value, str)
        assert len(value) > 0


def test_generate_checkbox(data_generator):
    """Test checkbox generation"""
    checkbox_field = FormField(
        field_id="newsletter",
        label="Subscribe to newsletter",
        type=FieldType.CHECKBOX,
        input_type="checkbox",
        xpath="//input[@name='newsletter']",
        css_selector="input[name='newsletter']",
        required=False,
        placeholder="",
        default_value="",
        options=[],
        validation=None,
        is_visible=True,
        source_file=None
    )
    
    data = data_generator.generate_field_data(checkbox_field, TestScenario.VALID, 10)
    
    assert len(data) == 10
    for item in data:
        assert item["field_id"] == "newsletter"
        assert item["value"] in ["true", "false"]


def test_generate_select_field(data_generator):
    """Test select field generation"""
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
    
    # Test valid selection
    data = data_generator.generate_field_data(select_field, TestScenario.VALID, 5)
    
    assert len(data) == 5
    for item in data:
        assert item["field_id"] == "country"
        assert item["scenario"] == "valid"
        assert item["value"] in ["USA", "Canada", "UK", "Australia"]
    
    # Test invalid selection
    invalid_data = data_generator.generate_field_data(select_field, TestScenario.INVALID, 3)
    for item in invalid_data:
        assert item["scenario"] == "invalid"
        assert item["value"] not in ["USA", "Canada", "UK", "Australia"]


@pytest.mark.asyncio
async def test_ai_generator_integration(ai_data_generator, sample_email_field, sample_password_field):
    """Test full AI data generator integration"""
    fields = [sample_email_field, sample_password_field]
    scenarios = [TestScenario.VALID, TestScenario.INVALID]
    
    result = await ai_data_generator.generate_test_data(
        fields=fields,
        scenarios=scenarios,
        count_per_scenario=2,
        use_ai=False  # Use fallback for now
    )
    
    # Verify structure
    assert "generation_timestamp" in result
    assert "ai_used" in result
    assert "method" in result
    assert "total_fields" in result
    assert "scenarios" in result
    assert "test_data" in result
    
    # Verify content
    assert result["total_fields"] == 2
    assert result["scenarios"] == ["valid", "invalid"]
    assert result["ai_used"] is False
    
    # Verify test data structure
    test_data = result["test_data"]
    assert "valid" in test_data
    assert "invalid" in test_data
    
    # Each scenario should have data for both fields (2 fields × 2 count = 4 items each)
    assert len(test_data["valid"]) == 4
    assert len(test_data["invalid"]) == 4
    
    # Verify field distribution
    valid_fields = [item["field_id"] for item in test_data["valid"]]
    assert valid_fields.count("email") == 2
    assert valid_fields.count("password") == 2


@pytest.mark.asyncio 
async def test_single_field_generation(ai_data_generator, sample_email_field):
    """Test single field data generation"""
    data = await ai_data_generator.generate_field_data(
        field=sample_email_field,
        scenario=TestScenario.VALID,
        count=3
    )
    
    assert len(data) == 3
    for item in data:
        assert item["field_id"] == "email"
        assert item["scenario"] == "valid"
        assert item["type"] == FieldType.EMAIL
        assert "@" in item["value"]


def test_all_field_types_generate(data_generator):
    """Test that all field types can generate data without errors"""
    for field_type in FieldType:
        field = FormField(
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
        
        # Should not raise an exception
        try:
            data = data_generator.generate_field_data(field, TestScenario.VALID, 1)
            assert len(data) == 1
            assert data[0]["field_id"] == f"test_{field_type.value}"
        except Exception as e:
            pytest.fail(f"Field type {field_type.value} generation failed: {str(e)}")


def test_scenario_types_coverage():
    """Test that all scenario types are covered"""
    scenarios = [TestScenario.VALID, TestScenario.INVALID, TestScenario.EDGE_CASE, TestScenario.BOUNDARY]
    data_generator = AdvancedDataGenerator()
    
    email_field = FormField(
        field_id="email",
        label="Email",
        type=FieldType.EMAIL,
        input_type="email",
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
    
    for scenario in scenarios:
        data = data_generator.generate_field_data(email_field, scenario, 1)
        assert len(data) == 1
        assert data[0]["scenario"] == scenario.value
