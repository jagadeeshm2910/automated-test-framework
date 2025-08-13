from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.crud import MetadataCRUD
from app.models.schemas import MetadataResponse, SourceType
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/metadata", tags=["metadata"])


@router.get("/", response_model=List[MetadataResponse])
async def get_all_metadata(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    source_type: Optional[SourceType] = Query(None, description="Filter by source type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all metadata records with pagination and filtering
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (1-1000)
    - **source_type**: Optional filter by source type (web_page or github_repository)
    """
    try:
        metadata_list = await MetadataCRUD.get_all(db, skip=skip, limit=limit, source_type=source_type)
        
        response_list = []
        for metadata in metadata_list:
            from app.models.schemas import FormField
            response_list.append(MetadataResponse(
                id=metadata.id,
                page_url=metadata.page_url,
                source_type=metadata.source_type,
                fields=[FormField(**field_data) for field_data in metadata.fields_data],
                extracted_at=metadata.extracted_at,
                created_at=metadata.created_at,
                updated_at=metadata.updated_at
            ))
        
        return response_list
        
    except Exception as e:
        logger.error(f"Error retrieving metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metadata: {str(e)}"
        )


@router.get("/{metadata_id}", response_model=MetadataResponse)
async def get_metadata_by_id(
    metadata_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve specific metadata record by ID
    
    - **metadata_id**: The ID of the metadata record to retrieve
    """
    try:
        metadata = await MetadataCRUD.get_by_id(db, metadata_id)
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata with ID {metadata_id} not found"
            )
        
        from app.models.schemas import FormField
        return MetadataResponse(
            id=metadata.id,
            page_url=metadata.page_url,
            source_type=metadata.source_type,
            fields=[FormField(**field_data) for field_data in metadata.fields_data],
            extracted_at=metadata.extracted_at,
            created_at=metadata.created_at,
            updated_at=metadata.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving metadata {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metadata: {str(e)}"
        )


@router.delete("/{metadata_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_metadata(
    metadata_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a metadata record and all associated test runs
    
    - **metadata_id**: The ID of the metadata record to delete
    
    This will cascade delete all associated test runs and screenshots.
    """
    try:
        deleted = await MetadataCRUD.delete(db, metadata_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata with ID {metadata_id} not found"
            )
        
        logger.info(f"Successfully deleted metadata {metadata_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting metadata {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete metadata: {str(e)}"
        )
