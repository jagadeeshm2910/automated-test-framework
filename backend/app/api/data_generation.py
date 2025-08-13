"""
Data generation API endpoints
Provides AI-powered test data generation for form fields
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.crud import MetadataCRUD
from app.models.schemas import FormField, FieldType
from app.services.ai_data_generator import AIDataGenerator, TestScenario
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/generate", tags=["data-generation"])

# Initialize the AI data generator
ai_generator = AIDataGenerator()


class DataGenerationRequest(BaseModel):
    """Request schema for test data generation"""
    scenarios: List[TestScenario] = [TestScenario.VALID, TestScenario.INVALID, TestScenario.EDGE_CASE]
    count_per_scenario: int = 3
    use_ai: bool = False  # Default to fallback until LLaMA is ready
    custom_constraints: Optional[Dict[str, Any]] = None


class BulkGenerationRequest(BaseModel):
    """Request schema for bulk test data generation"""
    metadata_ids: List[int]
    scenarios: List[TestScenario] = [TestScenario.VALID]
    count_per_scenario: int = 3
    use_ai: bool = False


class FieldGenerationRequest(BaseModel):
    """Request schema for single field data generation"""
    field_type: FieldType
    field_label: str = "Test Field"
    scenarios: List[TestScenario] = [TestScenario.VALID]
    count: int = 5
    constraints: Optional[Dict[str, Any]] = None


class DataGenerationResponse(BaseModel):
    """Response schema for generated test data"""
    metadata_id: Optional[int] = None
    generation_timestamp: str
    ai_used: bool
    method: str
    total_fields: int
    scenarios: List[str]
    test_data: Dict[str, Any]


@router.post("/bulk", response_model=List[DataGenerationResponse])
async def generate_bulk_test_data(
    request: BulkGenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate test data for multiple form metadata records
    
    - **metadata_ids**: List of metadata IDs to generate data for
    - **scenarios**: Test scenarios to generate
    - **count_per_scenario**: Number of samples per scenario
    - **use_ai**: Whether to use AI generation
    """
    try:
        results = []
        
        for metadata_id in request.metadata_ids:
            try:
                # Get metadata
                metadata = await MetadataCRUD.get_by_id(db, metadata_id)
                if not metadata:
                    logger.warning(f"Metadata {metadata_id} not found, skipping")
                    continue
                
                # Convert fields
                fields = []
                for field_data in metadata.fields_data:
                    try:
                        field = FormField(**field_data)
                        fields.append(field)
                    except Exception:
                        continue
                
                if not fields:
                    logger.warning(f"No valid fields in metadata {metadata_id}, skipping")
                    continue
                
                # Generate data
                generation_result = await ai_generator.generate_test_data(
                    fields=fields,
                    scenarios=request.scenarios,
                    count_per_scenario=request.count_per_scenario,
                    use_ai=request.use_ai
                )
                
                generation_result["metadata_id"] = metadata_id
                results.append(DataGenerationResponse(**generation_result))
                
            except Exception as e:
                logger.error(f"Error generating data for metadata {metadata_id}: {str(e)}")
                continue
        
        if not results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No valid metadata found for bulk generation"
            )
        
        logger.info(f"Generated bulk test data for {len(results)} metadata records")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk test data generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate bulk test data: {str(e)}"
        )


@router.post("/{metadata_id}", response_model=DataGenerationResponse)
async def generate_test_data(
    metadata_id: int,
    request: DataGenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate test data for specific form metadata
    
    - **metadata_id**: ID of the form metadata to generate data for
    - **scenarios**: List of test scenarios to generate (valid, invalid, edge_case)
    - **count_per_scenario**: Number of data samples per scenario
    - **use_ai**: Whether to use AI generation (fallback to patterns if unavailable)
    - **custom_constraints**: Optional custom constraints for generation
    """
    try:
        # Get metadata from database
        metadata = await MetadataCRUD.get_by_id(db, metadata_id)
        
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata with ID {metadata_id} not found"
            )
        
        # Convert stored fields data to FormField objects
        fields = []
        for field_data in metadata.fields_data:
            try:
                field = FormField(**field_data)
                fields.append(field)
            except Exception as field_error:
                logger.warning(f"Could not parse field data: {field_error}")
                continue
        
        if not fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No valid fields found in metadata"
            )
        
        # Generate test data
        generation_result = await ai_generator.generate_test_data(
            fields=fields,
            scenarios=request.scenarios,
            count_per_scenario=request.count_per_scenario,
            use_ai=request.use_ai
        )
        
        # Add metadata_id to response
        generation_result["metadata_id"] = metadata_id
        
        logger.info(f"Generated test data for metadata {metadata_id} with {len(fields)} fields")
        return DataGenerationResponse(**generation_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating test data for metadata {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate test data: {str(e)}"
        )
async def generate_bulk_test_data(
    request: BulkGenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate test data for multiple form metadata records
    
    - **metadata_ids**: List of metadata IDs to generate data for
    - **scenarios**: Test scenarios to generate
    - **count_per_scenario**: Number of samples per scenario
    - **use_ai**: Whether to use AI generation
    """
    try:
        results = []
        
        for metadata_id in request.metadata_ids:
            try:
                # Get metadata
                metadata = await MetadataCRUD.get_by_id(db, metadata_id)
                if not metadata:
                    logger.warning(f"Metadata {metadata_id} not found, skipping")
                    continue
                
                # Convert fields
                fields = []
                for field_data in metadata.fields_data:
                    try:
                        field = FormField(**field_data)
                        fields.append(field)
                    except Exception:
                        continue
                
                if not fields:
                    logger.warning(f"No valid fields in metadata {metadata_id}, skipping")
                    continue
                
                # Generate data
                generation_result = await ai_generator.generate_test_data(
                    fields=fields,
                    scenarios=request.scenarios,
                    count_per_scenario=request.count_per_scenario,
                    use_ai=request.use_ai
                )
                
                generation_result["metadata_id"] = metadata_id
                results.append(DataGenerationResponse(**generation_result))
                
            except Exception as e:
                logger.error(f"Error generating data for metadata {metadata_id}: {str(e)}")
                continue
        
        if not results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No valid metadata found for bulk generation"
            )
        
        logger.info(f"Generated bulk test data for {len(results)} metadata records")
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk test data generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate bulk test data: {str(e)}"
        )


@router.post("/field", response_model=Dict[str, Any])
async def generate_field_data(request: FieldGenerationRequest):
    """
    Generate test data for a specific field type
    
    - **field_type**: Type of field to generate data for
    - **field_label**: Label/description for context
    - **scenarios**: Test scenarios to generate
    - **count**: Number of data samples to generate
    - **constraints**: Optional constraints for generation
    """
    try:
        # Create a mock FormField for generation
        mock_field = FormField(
            field_id="mock_field",
            label=request.field_label,
            type=request.field_type,
            input_type=request.field_type.value,
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
        
        # Generate data for each scenario
        result = {
            "field_type": request.field_type.value,
            "field_label": request.field_label,
            "generation_timestamp": "",
            "scenarios": [s.value for s in request.scenarios],
            "test_data": {}
        }
        
        for scenario in request.scenarios:
            field_data = await ai_generator.generate_field_data(
                field=mock_field,
                scenario=scenario,
                count=request.count
            )
            result["test_data"][scenario.value] = field_data
            
        if field_data:
            result["generation_timestamp"] = field_data[0]["generated_at"]
        
        logger.info(f"Generated field data for type {request.field_type}")
        return result
        
    except Exception as e:
        logger.error(f"Error generating field data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate field data: {str(e)}"
        )


@router.get("/scenarios")
async def get_available_scenarios():
    """Get list of available test scenarios"""
    return {
        "scenarios": [
            {
                "name": scenario.value,
                "description": _get_scenario_description(scenario)
            }
            for scenario in TestScenario
        ]
    }


@router.get("/field-types")
async def get_supported_field_types():
    """Get list of supported field types for generation"""
    return {
        "field_types": [
            {
                "name": field_type.value,
                "description": _get_field_type_description(field_type)
            }
            for field_type in FieldType
        ]
    }


def _get_scenario_description(scenario: TestScenario) -> str:
    """Get description for test scenario"""
    descriptions = {
        TestScenario.VALID: "Generate valid data that should pass all validations",
        TestScenario.INVALID: "Generate invalid data that should fail validations",
        TestScenario.EDGE_CASE: "Generate edge case data to test boundary conditions",
        TestScenario.BOUNDARY: "Generate data at the exact boundaries of valid ranges"
    }
    return descriptions.get(scenario, "Unknown scenario")


def _get_field_type_description(field_type: FieldType) -> str:
    """Get description for field type"""
    descriptions = {
        FieldType.EMAIL: "Email address fields",
        FieldType.PASSWORD: "Password fields with security requirements",
        FieldType.PHONE: "Phone number fields in various formats",
        FieldType.TEXT: "General text input fields",
        FieldType.NUMBER: "Numeric input fields",
        FieldType.DATE: "Date picker fields",
        FieldType.TIME: "Time picker fields",
        FieldType.DATETIME: "Date and time fields",
        FieldType.URL: "URL/link fields",
        FieldType.CHECKBOX: "Checkbox (boolean) fields",
        FieldType.RADIO: "Radio button selection fields",
        FieldType.SELECT: "Dropdown selection fields",
        FieldType.TEXTAREA: "Multi-line text fields",
        FieldType.FILE: "File upload fields",
        FieldType.HIDDEN: "Hidden form fields"
    }
    return descriptions.get(field_type, "Unknown field type")
