import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_start_test_run_metadata_not_found(client: AsyncClient):
    """Test starting test run for non-existent metadata"""
    test_data = {
        "use_ai_data": True,
        "test_scenarios": ["valid_data"]
    }
    
    response = await client.post("/test/999", json=test_data)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_test_runs_metadata_not_found(client: AsyncClient):
    """Test getting test runs for non-existent metadata"""
    response = await client.get("/test/999/runs")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_test_workflow(client: AsyncClient):
    """Test complete test workflow: create metadata -> start test -> get runs"""
    # First create metadata
    extract_data = {
        "url": "https://example.com/test-form",
        "wait_for_js": True,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    assert create_response.status_code == 201
    metadata_id = create_response.json()["id"]
    
    # Start a test run
    test_data = {
        "use_ai_data": True,
        "test_scenarios": ["valid_data", "invalid_data"]
    }
    
    test_response = await client.post(f"/test/{metadata_id}", json=test_data)
    assert test_response.status_code == 201
    test_run_data = test_response.json()
    assert test_run_data["metadata_id"] == metadata_id
    assert test_run_data["status"] == "pending"
    assert "id" in test_run_data
    
    test_run_id = test_run_data["id"]
    
    # Get test runs for the metadata
    runs_response = await client.get(f"/test/{metadata_id}/runs")
    assert runs_response.status_code == 200
    runs_data = runs_response.json()
    assert len(runs_data) >= 1
    assert any(run["id"] == test_run_id for run in runs_data)
    
    # Clean up
    await client.delete(f"/metadata/{metadata_id}")


@pytest.mark.asyncio
async def test_start_test_run_with_different_scenarios(client: AsyncClient):
    """Test starting test runs with different scenarios"""
    # Create metadata first
    extract_data = {
        "url": "https://httpbin.org/forms/post",
        "wait_for_js": False,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    metadata_id = create_response.json()["id"]
    
    # Test with AI data generation
    test_data_ai = {
        "use_ai_data": True,
        "test_scenarios": ["valid_data"]
    }
    
    response = await client.post(f"/test/{metadata_id}", json=test_data_ai)
    assert response.status_code == 201
    
    # Test with regex fallback
    test_data_regex = {
        "use_ai_data": False,
        "test_scenarios": ["boundary_values"]
    }
    
    response = await client.post(f"/test/{metadata_id}", json=test_data_regex)
    assert response.status_code == 201
    
    # Verify multiple test runs exist
    runs_response = await client.get(f"/test/{metadata_id}/runs")
    assert runs_response.status_code == 200
    runs_data = runs_response.json()
    assert len(runs_data) == 2
    
    # Clean up
    await client.delete(f"/metadata/{metadata_id}")
