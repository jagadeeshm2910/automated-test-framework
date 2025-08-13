import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    """Test health check endpoint"""
    response = await client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint"""
    response = await client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == "UI Testing Framework API"
    assert data["version"] == "1.0.0"
    assert "endpoints" in data
    assert "docs" in data
    assert "health" in data


@pytest.mark.asyncio
async def test_docs_endpoints(client: AsyncClient):
    """Test that API documentation endpoints are accessible"""
    # Test OpenAPI docs
    response = await client.get("/docs")
    assert response.status_code == 200
    
    # Test ReDoc
    response = await client.get("/redoc")
    assert response.status_code == 200
    
    # Test OpenAPI schema
    response = await client.get("/openapi.json")
    assert response.status_code == 200
    
    schema = response.json()
    assert "openapi" in schema
    assert "info" in schema
    assert schema["info"]["title"] == "UI Testing Framework API"
