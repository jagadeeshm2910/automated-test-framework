import pytest
from httpx import AsyncClient
from app.models.schemas import SourceType


@pytest.mark.asyncio
async def test_get_all_metadata_empty(client: AsyncClient):
    """Test getting all metadata when database is empty"""
    response = await client.get("/metadata/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_metadata_by_id_not_found(client: AsyncClient):
    """Test getting metadata by ID that doesn't exist"""
    response = await client.get("/metadata/999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_metadata_not_found(client: AsyncClient):
    """Test deleting metadata that doesn't exist"""
    response = await client.delete("/metadata/999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_metadata_workflow(client: AsyncClient):
    """Test complete metadata workflow: create -> get -> delete"""
    # First create metadata via extraction
    extract_data = {
        "url": "https://example.com/test-form",
        "wait_for_js": True,
        "timeout": 30
    }
    
    create_response = await client.post("/extract/url", json=extract_data)
    assert create_response.status_code == 201
    metadata_id = create_response.json()["id"]
    
    # Get the metadata by ID
    get_response = await client.get(f"/metadata/{metadata_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["id"] == metadata_id
    assert data["page_url"] == "https://example.com/test-form"
    
    # Get all metadata (should include our new one)
    all_response = await client.get("/metadata/")
    assert all_response.status_code == 200
    all_data = all_response.json()
    assert len(all_data) >= 1
    assert any(item["id"] == metadata_id for item in all_data)
    
    # Delete the metadata
    delete_response = await client.delete(f"/metadata/{metadata_id}")
    assert delete_response.status_code == 204
    
    # Verify it's deleted
    get_deleted_response = await client.get(f"/metadata/{metadata_id}")
    assert get_deleted_response.status_code == 404


@pytest.mark.asyncio
async def test_get_metadata_with_pagination(client: AsyncClient):
    """Test metadata pagination parameters"""
    response = await client.get("/metadata/?skip=0&limit=10")
    assert response.status_code == 200
    
    response = await client.get("/metadata/?skip=0&limit=1000")
    assert response.status_code == 200
    
    # Test invalid pagination
    response = await client.get("/metadata/?skip=-1")
    assert response.status_code == 422
    
    response = await client.get("/metadata/?limit=0")
    assert response.status_code == 422


@pytest.mark.asyncio 
async def test_get_metadata_with_source_filter(client: AsyncClient):
    """Test metadata filtering by source type"""
    response = await client.get(f"/metadata/?source_type={SourceType.WEB_PAGE.value}")
    assert response.status_code == 200
    
    response = await client.get(f"/metadata/?source_type={SourceType.GITHUB_REPOSITORY.value}")
    assert response.status_code == 200
