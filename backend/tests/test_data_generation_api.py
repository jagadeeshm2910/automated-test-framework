"""
Test data generation API endpoints
"""
import pytest
from httpx import AsyncClient
from app.models.schemas import SourceType, FieldType


@pytest.mark.asyncio
async def test_generate_scenarios_endpoint(client: AsyncClient):
    """Test get available scenarios endpoint"""
    response = await client.get("/generate/scenarios")
    assert response.status_code == 200
    
    data = response.json()
    assert "scenarios" in data
    scenarios = data["scenarios"]
    
    # Check that we have the expected scenarios
    scenario_names = [s["name"] for s in scenarios]
    assert "valid" in scenario_names
    assert "invalid" in scenario_names
    assert "edge_case" in scenario_names
    assert "boundary" in scenario_names
    
    # Check structure
    for scenario in scenarios:
        assert "name" in scenario
        assert "description" in scenario


@pytest.mark.asyncio
async def test_generate_field_types_endpoint(client: AsyncClient):
    """Test get supported field types endpoint"""
    response = await client.get("/generate/field-types")
    assert response.status_code == 200
    
    data = response.json()
    assert "field_types" in data
    field_types = data["field_types"]
    
    # Check that we have expected field types
    type_names = [ft["name"] for ft in field_types]
    assert "email" in type_names
    assert "password" in type_names
    assert "text" in type_names
    assert "phone" in type_names
    
    # Check structure
    for field_type in field_types:
        assert "name" in field_type
        assert "description" in field_type


@pytest.mark.asyncio
async def test_generate_field_data_endpoint(client: AsyncClient):
    """Test field-specific data generation endpoint"""
    request_data = {
        "field_type": "email",
        "field_label": "Email Address",
        "scenarios": ["valid", "invalid"],
        "count": 3
    }
    
    response = await client.post("/generate/field", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["field_type"] == "email"
    assert data["field_label"] == "Email Address"
    assert "generation_timestamp" in data
    assert data["scenarios"] == ["valid", "invalid"]
    assert "test_data" in data
    
    test_data = data["test_data"]
    assert "valid" in test_data
    assert "invalid" in test_data
    
    # Check valid emails
    valid_emails = test_data["valid"]
    assert len(valid_emails) == 3
    for email_data in valid_emails:
        assert email_data["field_id"] == "mock_field"
        assert email_data["scenario"] == "valid"
        assert "@" in email_data["value"]
    
    # Check invalid emails
    invalid_emails = test_data["invalid"]
    assert len(invalid_emails) == 3
    for email_data in invalid_emails:
        assert email_data["field_id"] == "mock_field"
        assert email_data["scenario"] == "invalid"


@pytest.mark.asyncio
async def test_generate_metadata_data_endpoint(client: AsyncClient):
    """Test generating data for specific metadata"""
    # First create some metadata
    extract_data = {
        "url": "https://httpbin.org/forms/post",
        "wait_for_js": False,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    assert create_response.status_code == 201
    metadata_id = create_response.json()["id"]
    
    # Now generate test data for this metadata
    generation_request = {
        "scenarios": ["valid", "invalid"],
        "count_per_scenario": 2,
        "use_ai": False
    }
    
    response = await client.post(f"/generate/{metadata_id}", json=generation_request)
    assert response.status_code == 200
    
    data = response.json()
    assert data["metadata_id"] == metadata_id
    assert "generation_timestamp" in data
    assert data["ai_used"] is False
    assert data["method"] == "pattern"
    assert data["total_fields"] > 0
    assert data["scenarios"] == ["valid", "invalid"]
    
    test_data = data["test_data"]
    assert "valid" in test_data
    assert "invalid" in test_data
    
    # Should have data for each field × count_per_scenario
    valid_data = test_data["valid"]
    invalid_data = test_data["invalid"]
    
    expected_count = data["total_fields"] * 2  # 2 count_per_scenario
    assert len(valid_data) == expected_count
    assert len(invalid_data) == expected_count
    
    # Verify data structure
    for item in valid_data:
        assert "field_id" in item
        assert "value" in item
        assert "scenario" in item
        assert item["scenario"] == "valid"
        assert item["is_valid"] is True
    
    for item in invalid_data:
        assert item["scenario"] == "invalid"
        assert item["is_valid"] is False


@pytest.mark.asyncio
async def test_generate_metadata_not_found(client: AsyncClient):
    """Test generating data for non-existent metadata"""
    generation_request = {
        "scenarios": ["valid"],
        "count_per_scenario": 1,
        "use_ai": False
    }
    
    response = await client.post("/generate/999999", json=generation_request)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_generate_bulk_data_endpoint(client: AsyncClient):
    """Test bulk data generation for multiple metadata"""
    # Create multiple metadata records
    metadata_ids = []
    
    for i in range(2):
        extract_data = {
            "url": "https://httpbin.org/forms/post",
            "wait_for_js": False,
            "timeout": 30
        }
        
        create_response = await client.post("/extract/url", json=extract_data)
        assert create_response.status_code == 201
        metadata_ids.append(create_response.json()["id"])
    
    # Generate bulk test data
    bulk_request = {
        "metadata_ids": metadata_ids,
        "scenarios": ["valid"],
        "count_per_scenario": 1,
        "use_ai": False
    }
    
    response = await client.post("/generate/bulk", json=bulk_request)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2  # Should return data for both metadata
    
    for result in data:
        assert "metadata_id" in result
        assert result["metadata_id"] in metadata_ids
        assert "generation_timestamp" in result
        assert result["scenarios"] == ["valid"]
        assert "test_data" in result
        assert "valid" in result["test_data"]


@pytest.mark.asyncio
async def test_generate_bulk_data_empty_list(client: AsyncClient):
    """Test bulk data generation with no valid metadata"""
    bulk_request = {
        "metadata_ids": [999999, 999998],  # Non-existent IDs
        "scenarios": ["valid"],
        "count_per_scenario": 1,
        "use_ai": False
    }
    
    response = await client.post("/generate/bulk", json=bulk_request)
    assert response.status_code == 404
    assert "no valid metadata" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_generate_field_data_all_types(client: AsyncClient):
    """Test field data generation for all supported types"""
    field_types = ["email", "password", "phone", "text", "number"]
    
    for field_type in field_types:
        request_data = {
            "field_type": field_type,
            "field_label": f"Test {field_type}",
            "scenarios": ["valid"],
            "count": 1
        }
        
        response = await client.post("/generate/field", json=request_data)
        assert response.status_code == 200, f"Failed for field type: {field_type}"
        
        data = response.json()
        assert data["field_type"] == field_type
        assert "test_data" in data
        assert "valid" in data["test_data"]
        assert len(data["test_data"]["valid"]) == 1


@pytest.mark.asyncio
async def test_generate_field_data_invalid_type(client: AsyncClient):
    """Test field data generation with invalid field type"""
    request_data = {
        "field_type": "invalid_type",
        "field_label": "Test Field",
        "scenarios": ["valid"],
        "count": 1
    }
    
    response = await client.post("/generate/field", json=request_data)
    # Should get validation error for invalid field type
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_generate_with_edge_cases(client: AsyncClient):
    """Test data generation with edge case scenarios"""
    request_data = {
        "field_type": "email",
        "field_label": "Email Address",
        "scenarios": ["edge_case", "boundary"],
        "count": 2
    }
    
    response = await client.post("/generate/field", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    test_data = data["test_data"]
    
    assert "edge_case" in test_data
    assert "boundary" in test_data
    assert len(test_data["edge_case"]) == 2
    assert len(test_data["boundary"]) == 2
    
    # Edge case and boundary emails should still be strings
    for item in test_data["edge_case"]:
        assert isinstance(item["value"], str)
        assert item["scenario"] == "edge_case"
    
    for item in test_data["boundary"]:
        assert isinstance(item["value"], str)
        assert item["scenario"] == "boundary"


@pytest.mark.asyncio
async def test_generate_with_custom_constraints(client: AsyncClient):
    """Test data generation with custom constraints"""
    # First create metadata
    extract_data = {
        "url": "https://httpbin.org/forms/post",
        "wait_for_js": False,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    assert create_response.status_code == 201
    metadata_id = create_response.json()["id"]
    
    # Generate with custom constraints
    generation_request = {
        "scenarios": ["valid"],
        "count_per_scenario": 1,
        "use_ai": False,
        "custom_constraints": {
            "domain_preference": "example.com",
            "locale": "en_US"
        }
    }
    
    response = await client.post(f"/generate/{metadata_id}", json=generation_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "test_data" in data
    # Custom constraints are included in request but implementation is future work
