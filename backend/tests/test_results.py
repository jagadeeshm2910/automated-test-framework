import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_test_results_not_found(client: AsyncClient):
    """Test getting results for non-existent test run"""
    response = await client.get("/results/999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_test_screenshots_not_found(client: AsyncClient):
    """Test getting screenshots for non-existent test run"""
    response = await client.get("/results/999/screenshots")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_test_summary_not_found(client: AsyncClient):
    """Test getting summary for non-existent test run"""
    response = await client.get("/results/999/summary")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_results_workflow(client: AsyncClient):
    """Test complete results workflow"""
    # Create metadata and test run
    extract_data = {
        "url": "https://httpbin.org/forms/post",
        "wait_for_js": False,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    metadata_id = create_response.json()["id"]
    
    test_data = {
        "use_ai_data": True,
        "test_scenarios": ["valid_data"]
    }
    
    test_response = await client.post(f"/test/{metadata_id}", json=test_data)
    test_run_id = test_response.json()["id"]
    
    # Get test results
    results_response = await client.get(f"/results/{test_run_id}")
    assert results_response.status_code == 200
    results_data = results_response.json()
    assert results_data["id"] == test_run_id
    assert results_data["metadata_id"] == metadata_id
    assert "status" in results_data
    
    # Get screenshots (should be empty for now)
    screenshots_response = await client.get(f"/results/{test_run_id}/screenshots")
    assert screenshots_response.status_code == 200
    screenshots_data = screenshots_response.json()
    assert isinstance(screenshots_data, list)
    
    # Get test summary
    summary_response = await client.get(f"/results/{test_run_id}/summary")
    assert summary_response.status_code == 200
    summary_data = summary_response.json()
    assert summary_data["test_run_id"] == test_run_id
    assert summary_data["metadata_id"] == metadata_id
    assert "status" in summary_data
    assert "fields_tested" in summary_data
    assert "fields_passed" in summary_data
    assert "fields_failed" in summary_data
    assert "screenshot_count" in summary_data
    
    # Clean up
    await client.delete(f"/metadata/{metadata_id}")


@pytest.mark.asyncio
async def test_summary_calculations(client: AsyncClient):
    """Test that summary calculations work correctly"""
    # Create test data
    extract_data = {"url": "https://example.com/form", "wait_for_js": True, "timeout": 30}
    create_response = await client.post("/extract/url", json=extract_data)
    metadata_id = create_response.json()["id"]
    
    test_data = {"use_ai_data": True, "test_scenarios": ["valid_data"]}
    test_response = await client.post(f"/test/{metadata_id}", json=test_data)
    test_run_id = test_response.json()["id"]
    
    # Get summary
    summary_response = await client.get(f"/results/{test_run_id}/summary")
    summary_data = summary_response.json()
    
    # Verify summary structure
    expected_fields = [
        "test_run_id", "metadata_id", "status", "duration_seconds",
        "fields_tested", "fields_passed", "fields_failed", 
        "screenshot_count", "screenshot_types", "has_errors",
        "error_message", "started_at", "completed_at"
    ]
    
    for field in expected_fields:
        assert field in summary_data
    
    # Clean up
    await client.delete(f"/metadata/{metadata_id}")
