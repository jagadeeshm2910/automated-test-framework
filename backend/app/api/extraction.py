from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.crud import MetadataCRUD, GitHubRepositoryCRUD
from app.models.schemas import (
    MetadataResponse, 
    URLExtractionRequest, 
    GitHubExtractionRequest,
    SourceType,
    FormField
)
from app.services.web_scraper import WebScraperService
from app.services.github_scanner import GitHubScannerService
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/extract", tags=["extraction"])


@router.post("/url", response_model=MetadataResponse, status_code=status.HTTP_201_CREATED)
async def extract_url_metadata(
    request: URLExtractionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Extract form field metadata from a live webpage
    
    This endpoint will:
    1. Load the webpage using Playwright for dynamic content
    2. Parse HTML with lxml for form field extraction
    3. Store the extracted metadata in the database
    4. Return the structured metadata following the JSON contract
    """
    try:
        logger.info(f"Starting URL extraction for: {request.url}")
        
        # Use shorter timeout if not specified
        timeout = min(request.timeout or 15, 60)  # Max 60 seconds, default 15
        
        logger.info(f"Using timeout: {timeout}s, wait_for_js: {request.wait_for_js}")
        
        # Use web scraper service to extract metadata
        async with WebScraperService() as scraper:
            metadata_create = await scraper.extract_metadata_from_url(
                url=request.url,
                wait_for_js=request.wait_for_js,
                timeout=timeout
            )
        
        # Store metadata in database
        metadata_crud = MetadataCRUD(db)
        metadata = await metadata_crud.create_metadata(metadata_create)
        
        logger.info(f"Successfully extracted and stored metadata for {request.url}")
        return metadata
        
    except ValueError as e:
        logger.error(f"Validation error extracting URL metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error extracting URL metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract metadata from URL: {str(e)}"
        )


@router.post("/github", response_model=MetadataResponse, status_code=status.HTTP_201_CREATED)
async def extract_github_metadata(
    request: GitHubExtractionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Extract form field metadata from a GitHub repository
    
    This endpoint will:
    1. Clone or access the GitHub repository
    2. Scan specified file patterns for form definitions
    3. Parse React/Vue/HTML components for form fields
    4. Store the extracted metadata in the database
    5. Return the structured metadata following the JSON contract
    """
    try:
        logger.info(f"Starting GitHub extraction for: {request.repository_url}")
        
        # Use GitHub scanner service to extract metadata
        async with GitHubScannerService() as scanner:
            metadata_create = await scanner.extract_metadata_from_repository(
                repository_url=request.repository_url,
                branch=request.branch,
                file_patterns=request.file_patterns
            )
        
        # Store repository info first
        try:
            # Parse GitHub URL to get owner/repo
            url_parts = str(request.repository_url).rstrip('/').split('/')
            if len(url_parts) >= 2:
                owner = url_parts[-2]
                repo_name = url_parts[-1]
                
                github_repo_crud = GitHubRepositoryCRUD(db)
                await github_repo_crud.create_repository(
                    str(request.repository_url), 
                    owner, 
                    repo_name, 
                    request.branch
                )
        except Exception as repo_error:
            logger.warning(f"Could not store repository info: {repo_error}")
        
        # Store metadata in database
        metadata_crud = MetadataCRUD(db)
        metadata = await metadata_crud.create_metadata(metadata_create)
        
        logger.info(f"Successfully extracted GitHub metadata for {request.repository_url}")
        return metadata
        
    except ValueError as e:
        logger.error(f"Validation error extracting GitHub metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error extracting GitHub metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract metadata from GitHub repository: {str(e)}"
        )
