from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.crud import TestRunCRUD, MetadataCRUD, ScreenshotCRUD
from app.models.schemas import TestRunRequest, TestRunResponse, TestStatus, FormField
from app.services.ai_data_generator import AIDataGenerator, TestScenario
from app.services.playwright_test_runner import PlaywrightTestRunner
from typing import List, Dict, Any
import logging
import asyncio
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/test", tags=["testing"])

# Initialize AI data generator
ai_generator = AIDataGenerator()


async def execute_test_run(
    test_run_id: int,
    page_url: str,
    fields: List[FormField],
    test_data: Dict[str, Any]
):
    """
    Background task to execute Playwright tests
    
    Args:
        test_run_id: Database ID of the test run
        page_url: URL to test
        fields: Form fields to test
        test_data: Generated test data
    """
    from app.database import SessionLocal
    
    async with SessionLocal() as db:
        try:
            logger.info(f"Starting background test execution for test run {test_run_id}")
            
            # Update status to running
            await TestRunCRUD.update_status(db, test_run_id, TestStatus.RUNNING)
            
            # Run Playwright tests
            async with PlaywrightTestRunner(headless=True) as runner:
                all_results = []
                all_screenshots = []
                
                # Test each scenario in the data
                for scenario, scenario_data in test_data.items():
                    if scenario_data:  # Only test scenarios with data
                        logger.info(f"Testing scenario: {scenario}")
                        
                        results, screenshots = await runner.run_test_scenario(
                            test_run_id=test_run_id,
                            page_url=page_url,
                            fields=fields,
                            test_data={scenario: scenario_data},
                            scenario=scenario
                        )
                        
                        all_results.extend(results)
                        all_screenshots.extend(screenshots)
                
                # Save screenshots to database
                for screenshot_path in all_screenshots:
                    if screenshot_path:
                        await ScreenshotCRUD.create(db, {
                            "test_run_id": test_run_id,
                            "file_path": screenshot_path,
                            "screenshot_type": "test_evidence",
                            "file_size": 0  # Will be updated later
                        })
                
                # Prepare test results for storage
                test_results = {
                    "scenarios": {},
                    "summary": {
                        "total_tests": len(all_results),
                        "passed": sum(1 for r in all_results if r.success),
                        "failed": sum(1 for r in all_results if not r.success),
                        "scenarios_tested": list(test_data.keys())
                    }
                }
                
                # Group results by scenario
                for result in all_results:
                    scenario = "default"  # Could be enhanced to track scenario per result
                    if scenario not in test_results["scenarios"]:
                        test_results["scenarios"][scenario] = []
                    
                    test_results["scenarios"][scenario].append({
                        "field_id": result.field_id,
                        "field_type": result.field_type,
                        "test_value": result.test_value,
                        "success": result.success,
                        "error_message": result.error_message
                    })
                
                # Update test run with results
                await TestRunCRUD.update_results(
                    db, 
                    test_run_id, 
                    TestStatus.COMPLETED,
                    test_results
                )
                
                logger.info(f"Completed test execution for test run {test_run_id}")
                
        except Exception as e:
            logger.error(f"Error in background test execution {test_run_id}: {str(e)}")
            
            # Update status to failed
            try:
                await TestRunCRUD.update_results(
                    db,
                    test_run_id,
                    TestStatus.FAILED,
                    {"error": str(e), "summary": {"total_tests": 0, "passed": 0, "failed": 1}}
                )
            except Exception as update_error:
                logger.error(f"Failed to update test run status: {str(update_error)}")


@router.post("/{metadata_id}", response_model=TestRunResponse, status_code=status.HTTP_201_CREATED)
async def start_test_run(
    metadata_id: int,
    test_request: TestRunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new test run for the specified metadata
    
    This endpoint will:
    1. Validate that the metadata exists
    2. Create a new test run record
    3. Trigger the test execution process (async)
    4. Return the test run information
    
    - **metadata_id**: The ID of the metadata to test
    - **test_request**: Test configuration including AI data generation preference
    """
    try:
        # Verify metadata exists
        metadata = await MetadataCRUD.get_by_id(db, metadata_id)
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata with ID {metadata_id} not found"
            )
        
        # Generate test data using AI service
        generated_data = None
        if test_request.use_ai_data:
            try:
                # Convert stored fields data to FormField objects
                fields = []
                for field_data in metadata.fields_data:
                    try:
                        field = FormField(**field_data)
                        fields.append(field)
                    except Exception as field_error:
                        logger.warning(f"Could not parse field data: {field_error}")
                        continue
                
                if fields:
                    # Map test scenarios from request
                    scenarios = []
                    for scenario_name in test_request.test_scenarios:
                        try:
                            scenario = TestScenario(scenario_name)
                            scenarios.append(scenario)
                        except ValueError:
                            logger.warning(f"Unknown test scenario: {scenario_name}")
                    
                    if not scenarios:
                        scenarios = [TestScenario.VALID]  # Default scenario
                    
                    # Generate test data
                    logger.info(f"Generating test data for {len(fields)} fields with scenarios: {[s.value for s in scenarios]}")
                    generation_result = await ai_generator.generate_test_data(
                        fields=fields,
                        scenarios=scenarios,
                        count_per_scenario=3,
                        use_ai=False  # Use fallback patterns for now
                    )
                    generated_data = generation_result
                    logger.info(f"Successfully generated test data for test run")
                else:
                    logger.warning("No valid fields found for test data generation")
            except Exception as gen_error:
                logger.error(f"Error generating test data: {gen_error}")
                # Continue without generated data
        
        # Create test run with generated data
        test_run = await TestRunCRUD.create(db, metadata_id, test_request, generated_data)
        
        logger.info(f"Created test run {test_run.id} for metadata {metadata_id}")
        
        # Start background test execution if we have generated data
        if generated_data and test_request.use_ai_data:
            background_tasks.add_task(
                execute_test_run,
                test_run.id,
                metadata.page_url,
                fields,
                generated_data
            )
            logger.info(f"Scheduled background test execution for test run {test_run.id}")
        
        return TestRunResponse(
            id=test_run.id,
            metadata_id=test_run.metadata_id,
            status=test_run.status,
            generated_data=test_run.generated_data,
            test_results=test_run.test_results,
            error_message=test_run.error_message,
            started_at=test_run.started_at,
            completed_at=test_run.completed_at,
            created_at=test_run.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting test run for metadata {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start test run: {str(e)}"
        )


@router.get("/{metadata_id}/runs", response_model=List[TestRunResponse])
async def get_test_runs_by_metadata(
    metadata_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all test runs for a specific metadata record
    
    - **metadata_id**: The ID of the metadata to get test runs for
    """
    try:
        # Verify metadata exists
        metadata = await MetadataCRUD.get_by_id(db, metadata_id)
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Metadata with ID {metadata_id} not found"
            )
        
        test_runs = await TestRunCRUD.get_by_metadata_id(db, metadata_id)
        
        return [
            TestRunResponse(
                id=test_run.id,
                metadata_id=test_run.metadata_id,
                status=test_run.status,
                generated_data=test_run.generated_data,
                test_results=test_run.test_results,
                error_message=test_run.error_message,
                started_at=test_run.started_at,
                completed_at=test_run.completed_at,
                created_at=test_run.created_at
            )
            for test_run in test_runs
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving test runs for metadata {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve test runs: {str(e)}"
        )


@router.get("/run/{test_run_id}", response_model=TestRunResponse)
async def get_test_run(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get details of a specific test run
    
    - **test_run_id**: The ID of the test run to retrieve
    """
    try:
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if not test_run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test run with ID {test_run_id} not found"
            )
        
        return TestRunResponse(
            id=test_run.id,
            metadata_id=test_run.metadata_id,
            status=test_run.status,
            generated_data=test_run.generated_data,
            test_results=test_run.test_results,
            error_message=test_run.error_message,
            started_at=test_run.started_at,
            completed_at=test_run.completed_at,
            created_at=test_run.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving test run {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve test run: {str(e)}"
        )


@router.get("/run/{test_run_id}/screenshots")
async def get_test_run_screenshots(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all screenshots for a specific test run
    
    - **test_run_id**: The ID of the test run to get screenshots for
    """
    try:
        # Verify test run exists
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if not test_run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test run with ID {test_run_id} not found"
            )
        
        screenshots = await ScreenshotCRUD.get_by_test_run_id(db, test_run_id)
        
        return {
            "test_run_id": test_run_id,
            "screenshots": [
                {
                    "id": screenshot.id,
                    "file_path": screenshot.file_path,
                    "screenshot_type": screenshot.screenshot_type,
                    "file_size": screenshot.file_size,
                    "created_at": screenshot.created_at
                }
                for screenshot in screenshots
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving screenshots for test run {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve screenshots: {str(e)}"
        )


@router.delete("/run/{test_run_id}")
async def delete_test_run(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a test run and all associated data
    
    - **test_run_id**: The ID of the test run to delete
    """
    try:
        # Verify test run exists
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if not test_run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test run with ID {test_run_id} not found"
            )
        
        # Delete associated screenshots from filesystem
        screenshots = await ScreenshotCRUD.get_by_test_run_id(db, test_run_id)
        for screenshot in screenshots:
            try:
                import os
                if os.path.exists(screenshot.file_path):
                    os.remove(screenshot.file_path)
                    logger.info(f"Deleted screenshot file: {screenshot.file_path}")
            except Exception as file_error:
                logger.warning(f"Could not delete screenshot file {screenshot.file_path}: {file_error}")
        
        # Delete from database
        success = await TestRunCRUD.delete(db, test_run_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete test run"
            )
        
        return {"message": f"Test run {test_run_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting test run {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete test run: {str(e)}"
        )
