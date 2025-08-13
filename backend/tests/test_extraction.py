import pytest
from httpx import AsyncClient
from app.models.schemas import URLExtractionRequest, SourceType


@pytest.mark.asyncio
async def test_extract_url_metadata(client: AsyncClient):
    """Test URL metadata extraction endpoint"""
    request_data = {
        "url": "https://example.com/register",
        "wait_for_js": True,
        "timeout": 30
    }
    
    response = await client.post("/extract/url", json=request_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["page_url"] == "https://example.com/register"
    assert data["source_type"] == SourceType.WEB_PAGE
    assert "id" in data
    assert "extracted_at" in data
    assert "fields" in data
    assert isinstance(data["fields"], list)


@pytest.mark.asyncio
async def test_extract_github_metadata(client: AsyncClient):
    """Test GitHub metadata extraction endpoint"""
    # Skip this test if we're hitting rate limits
    pytest.skip("Skipping GitHub API test to avoid rate limits")
    
    request_data = {
        "repository_url": "https://github.com/octocat/Hello-World",
        "branch": "master",
        "file_patterns": ["**/*.html"]
    }
    
    response = await client.post("/extract/github", json=request_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["page_url"] == "https://github.com/octocat/Hello-World"
    assert data["source_type"] == SourceType.GITHUB_REPOSITORY
    assert "id" in data
    assert "extracted_at" in data
    assert "fields" in data


@pytest.mark.asyncio
async def test_extract_url_invalid_url(client: AsyncClient):
    """Test URL extraction with invalid URL"""
    request_data = {
        "url": "not-a-valid-url",
        "wait_for_js": True,
        "timeout": 30
    }
    
    response = await client.post("/extract/url", json=request_data)
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_extract_github_invalid_url(client: AsyncClient):
    """Test GitHub extraction with invalid URL"""
    request_data = {
        "repository_url": "https://not-github.com/test/repo",
        "branch": "main"
    }
    
    response = await client.post("/extract/github", json=request_data)
    assert response.status_code == 422  # Validation error
