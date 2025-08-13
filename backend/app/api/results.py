from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, case
from app.database import get_db
from app.models.crud import TestRunCRUD, ScreenshotCRUD, MetadataCRUD
from app.models.schemas import TestRunResponse, ScreenshotResponse
from app.models import TestRun, FieldMetadata, Screenshot
from app.services.analytics_service import AnalyticsService, ReportingService
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/results", tags=["results"])


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/global", response_model=Dict[str, Any])
async def get_global_analytics(
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive global system analytics
    
    Provides:
    - Total counts of metadata, test runs, screenshots
    - Test run status breakdown with success rates
    - Source type distribution (web pages vs GitHub)
    - Recent activity metrics
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_global_metrics(db)
        
    except Exception as e:
        logger.error(f"Error retrieving global analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve global analytics: {str(e)}"
        )


@router.get("/analytics/performance", response_model=Dict[str, Any])
async def get_performance_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get performance metrics and trends over time
    
    Provides:
    - Execution time statistics (avg, min, max, median)
    - Daily activity trends
    - Performance patterns and insights
    
    - **days**: Number of days to analyze (1-365, default: 30)
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_performance_metrics(db, days)
        
    except Exception as e:
        logger.error(f"Error retrieving performance analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve performance analytics: {str(e)}"
        )


@router.get("/analytics/field-types", response_model=Dict[str, Any])
async def get_field_type_analytics(
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze field type usage and distribution
    
    Provides:
    - Field type frequency analysis
    - Distribution across all forms
    - Most common field types
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_field_type_analytics(db)
        
    except Exception as e:
        logger.error(f"Error retrieving field type analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve field type analytics: {str(e)}"
        )


@router.get("/analytics/failures", response_model=Dict[str, Any])
async def get_failure_analytics(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of failures to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze test failures to identify patterns
    
    Provides:
    - Error categorization and frequency
    - Most problematic forms/metadata
    - Recent failure details
    - Failure pattern insights
    
    - **limit**: Maximum number of failed runs to analyze (1-100, default: 20)
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_failure_analysis(db, limit)
        
    except Exception as e:
        logger.error(f"Error retrieving failure analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve failure analytics: {str(e)}"
        )


@router.get("/analytics/screenshots", response_model=Dict[str, Any])
async def get_screenshot_analytics(
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze screenshot capture patterns and storage metrics
    
    Provides:
    - Screenshot type distribution
    - Storage usage metrics
    - File size statistics
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_screenshot_analytics(db)
        
    except Exception as e:
        logger.error(f"Error retrieving screenshot analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve screenshot analytics: {str(e)}"
        )


@router.get("/analytics/metadata/{metadata_id}", response_model=Dict[str, Any])
async def get_metadata_insights(
    metadata_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed insights for a specific form/metadata
    
    Provides:
    - Test execution statistics for this form
    - Performance metrics
    - Field complexity analysis
    - Success/failure patterns
    
    - **metadata_id**: ID of the metadata to analyze
    """
    try:
        analytics = AnalyticsService()
        return await analytics.get_metadata_insights(db, metadata_id)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error retrieving metadata insights for {metadata_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metadata insights: {str(e)}"
        )


# ============================================================================
# REPORTING ENDPOINTS
# ============================================================================

@router.get("/reports/executive-summary", response_model=Dict[str, Any])
async def get_executive_summary(
    db: AsyncSession = Depends(get_db)
):
    """
    Generate comprehensive executive summary report
    
    Provides:
    - Key performance indicators
    - System health overview
    - Quality insights and trends
    - Actionable recommendations
    """
    try:
        reporting = ReportingService()
        return await reporting.generate_executive_summary(db)
        
    except Exception as e:
        logger.error(f"Error generating executive summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate executive summary: {str(e)}"
        )


@router.get("/reports/dashboard", response_model=Dict[str, Any])
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db)
):
    """
    Get consolidated data for dashboard display
    
    Provides optimized data structure for frontend dashboards:
    - Key metrics summary
    - Recent activity
    - Quick insights
    - Status indicators
    """
    try:
        analytics = AnalyticsService()
        
        # Gather essential dashboard data
        global_metrics = await analytics.get_global_metrics(db)
        performance_metrics = await analytics.get_performance_metrics(db, days=7)  # Last week
        failure_analysis = await analytics.get_failure_analysis(db, limit=5)  # Recent failures
        
        # Create dashboard-optimized structure
        dashboard_data = {
            "overview": {
                "total_forms": global_metrics["totals"]["metadata_records"],
                "total_test_runs": global_metrics["totals"]["test_runs"],
                "success_rate": global_metrics["test_run_status"]["success_rate_percent"],
                "recent_activity": global_metrics["recent_activity"]["test_runs_last_7_days"]
            },
            "status_distribution": global_metrics["test_run_status"],
            "performance": {
                "avg_execution_time": performance_metrics.get("execution_times", {}).get("average_seconds", 0),
                "tests_this_week": performance_metrics.get("total_runs_analyzed", 0)
            },
            "quality": {
                "recent_failures": len(failure_analysis.get("recent_failures", [])),
                "most_common_error": failure_analysis.get("most_common_error", ("none", 0))[0] if failure_analysis.get("most_common_error") else "none"
            },
            "trends": {
                "daily_activity": performance_metrics.get("daily_activity", [])
            },
            "last_updated": global_metrics["generated_at"]
        }
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error generating dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dashboard data: {str(e)}"
        )


# ============================================================================
# ADVANCED ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/trends/success-rate", response_model=Dict[str, Any])
async def get_success_rate_trends(
    days: int = Query(30, ge=7, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get success rate trends over time
    
    Provides daily success rate calculations to identify patterns and trends
    
    - **days**: Number of days to analyze (7-365, default: 30)
    """
    try:
        from datetime import datetime, timedelta
        from sqlalchemy import func, Date, case
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Query for daily success rates
        daily_stats = await db.execute(
            select(
                func.date(TestRun.created_at).label('date'),
                func.count(TestRun.id).label('total'),
                func.sum(
                    case((TestRun.status == 'completed', 1), else_=0)
                ).label('completed'),
                func.sum(
                    case((TestRun.status == 'failed', 1), else_=0)
                ).label('failed')
            )
            .where(TestRun.created_at >= cutoff_date)
            .group_by(func.date(TestRun.created_at))
            .order_by(func.date(TestRun.created_at))
        )
        
        results = daily_stats.all()
        
        # Calculate success rates
        trend_data = []
        for row in results:
            total_finished = row.completed + row.failed
            success_rate = (row.completed / total_finished * 100) if total_finished > 0 else 0
            
            trend_data.append({
                "date": row.date.isoformat(),
                "total_runs": row.total,
                "completed": row.completed,
                "failed": row.failed,
                "success_rate": round(success_rate, 2)
            })
        
        # Calculate overall trend
        if len(trend_data) >= 2:
            first_week = trend_data[:7] if len(trend_data) >= 7 else trend_data[:len(trend_data)//2]
            last_week = trend_data[-7:] if len(trend_data) >= 7 else trend_data[len(trend_data)//2:]
            
            avg_first = sum(d["success_rate"] for d in first_week) / len(first_week)
            avg_last = sum(d["success_rate"] for d in last_week) / len(last_week)
            trend_direction = "improving" if avg_last > avg_first else "declining" if avg_last < avg_first else "stable"
        else:
            trend_direction = "insufficient_data"
        
        return {
            "analysis_period_days": days,
            "daily_success_rates": trend_data,
            "trend_analysis": {
                "direction": trend_direction,
                "total_days_analyzed": len(trend_data)
            },
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving success rate trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve success rate trends: {str(e)}"
        )


@router.get("/analytics/comparison/metadata", response_model=Dict[str, Any])
async def compare_metadata_performance(
    metadata_ids: str = Query(..., description="Comma-separated list of metadata IDs to compare"),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare performance metrics across multiple forms/metadata
    
    Provides side-by-side comparison of test execution metrics
    
    - **metadata_ids**: Comma-separated list of metadata IDs (e.g., "1,2,3")
    """
    try:
        # Parse metadata IDs
        try:
            id_list = [int(id_str.strip()) for id_str in metadata_ids.split(",")]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid metadata_ids format. Use comma-separated integers."
            )
        
        if len(id_list) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum of 10 metadata records can be compared at once."
            )
        
        analytics = AnalyticsService()
        comparison_data = []
        
        for metadata_id in id_list:
            try:
                insights = await analytics.get_metadata_insights(db, metadata_id)
                
                # Extract key metrics for comparison
                comparison_data.append({
                    "metadata_id": metadata_id,
                    "page_url": insights["page_url"],
                    "total_test_runs": insights["test_statistics"]["total_test_runs"],
                    "success_rate": insights["test_statistics"]["success_rate_percent"],
                    "avg_execution_time": insights["performance"]["average_execution_seconds"],
                    "form_complexity": insights["form_analysis"]["total_fields"],
                    "last_test": insights["recent_test_runs"][0]["created_at"] if insights["recent_test_runs"] else None
                })
                
            except ValueError:
                # Metadata not found
                comparison_data.append({
                    "metadata_id": metadata_id,
                    "error": "Metadata not found"
                })
        
        # Calculate comparative insights
        valid_data = [d for d in comparison_data if "error" not in d]
        
        if valid_data:
            best_performing = max(valid_data, key=lambda x: x["success_rate"])
            fastest_execution = min(valid_data, key=lambda x: x["avg_execution_time"]) if valid_data else None
            most_complex = max(valid_data, key=lambda x: x["form_complexity"]) if valid_data else None
        else:
            best_performing = fastest_execution = most_complex = None
        
        return {
            "comparison_data": comparison_data,
            "insights": {
                "best_performing": {
                    "metadata_id": best_performing["metadata_id"],
                    "success_rate": best_performing["success_rate"]
                } if best_performing else None,
                "fastest_execution": {
                    "metadata_id": fastest_execution["metadata_id"],
                    "avg_time": fastest_execution["avg_execution_time"]
                } if fastest_execution else None,
                "most_complex": {
                    "metadata_id": most_complex["metadata_id"],
                    "field_count": most_complex["form_complexity"]
                } if most_complex else None
            },
            "generated_at": datetime.utcnow()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing metadata performance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare metadata performance: {str(e)}"
        )


@router.get("/analytics/health-check", response_model=Dict[str, Any])
async def get_system_health(
    db: AsyncSession = Depends(get_db)
):
    """
    Get system health indicators and status
    
    Provides real-time health assessment:
    - System activity levels
    - Error rates
    - Performance indicators
    - Resource utilization
    """
    try:
        from datetime import datetime, timedelta
        
        # Check recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        recent_runs = await db.execute(
            select(func.count(TestRun.id)).where(TestRun.created_at >= yesterday)
        )
        
        recent_failures = await db.execute(
            select(func.count(TestRun.id)).where(
                and_(TestRun.created_at >= yesterday, TestRun.status == 'failed')
            )
        )
        
        running_tests = await db.execute(
            select(func.count(TestRun.id)).where(TestRun.status == 'running')
        )
        
        pending_tests = await db.execute(
            select(func.count(TestRun.id)).where(TestRun.status == 'pending')
        )
        
        # Calculate health scores
        total_recent = recent_runs.scalar()
        total_failures = recent_failures.scalar()
        
        error_rate = (total_failures / total_recent * 100) if total_recent > 0 else 0
        
        # Health status determination
        if error_rate <= 5:
            health_status = "excellent"
        elif error_rate <= 15:
            health_status = "good"
        elif error_rate <= 30:
            health_status = "fair"
        else:
            health_status = "poor"
        
        # Activity level
        if total_recent >= 50:
            activity_level = "high"
        elif total_recent >= 10:
            activity_level = "moderate"
        elif total_recent > 0:
            activity_level = "low"
        else:
            activity_level = "inactive"
        
        return {
            "overall_health": health_status,
            "activity_level": activity_level,
            "metrics": {
                "recent_test_runs_24h": total_recent,
                "recent_failures_24h": total_failures,
                "error_rate_percent": round(error_rate, 2),
                "currently_running": running_tests.scalar(),
                "pending_tests": pending_tests.scalar()
            },
            "status_indicators": {
                "accepting_new_tests": True,  # Could be enhanced with resource checks
                "system_responsive": True,    # Could be enhanced with performance checks
                "storage_healthy": True       # Could be enhanced with disk space checks
            },
            "recommendations": [
                "System is operating normally" if health_status in ["excellent", "good"] else
                "Monitor error rates - consider investigating recent failures" if health_status == "fair" else
                "High error rate detected - immediate investigation recommended"
            ],
            "checked_at": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error checking system health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check system health: {str(e)}"
        )


# ============================================================================
# EXISTING ENDPOINTS (Enhanced)
# ============================================================================

@router.get("/{test_run_id}", response_model=TestRunResponse)
async def get_test_results(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve test results for a specific test run
    
    This endpoint returns:
    - Test run status and timing information
    - Generated test data that was used
    - Detailed pass/fail results for each field
    - Any error messages encountered
    
    - **test_run_id**: The ID of the test run to get results for
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
        logger.error(f"Error retrieving test results {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve test results: {str(e)}"
        )


@router.get("/{test_run_id}/screenshots", response_model=List[ScreenshotResponse])
async def get_test_screenshots(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all screenshots for a specific test run
    
    Screenshots are taken at different stages:
    - 'before': Initial page state before form filling
    - 'after': Page state after form submission
    - 'error': Page state when an error occurs
    
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
        
        return [
            ScreenshotResponse(
                id=screenshot.id,
                test_run_id=screenshot.test_run_id,
                screenshot_type=screenshot.screenshot_type,
                file_path=screenshot.file_path,
                file_size=screenshot.file_size,
                taken_at=screenshot.taken_at
            )
            for screenshot in screenshots
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving screenshots for test run {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve screenshots: {str(e)}"
        )


@router.get("/{test_run_id}/summary", response_model=Dict[str, Any])
async def get_test_summary(
    test_run_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a comprehensive summary of test run results
    
    This endpoint provides:
    - Overall test status
    - Field-by-field pass/fail breakdown
    - Performance metrics (timing)
    - Screenshot count and types
    - Error summary if applicable
    
    - **test_run_id**: The ID of the test run to summarize
    """
    try:
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if not test_run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test run with ID {test_run_id} not found"
            )
        
        screenshots = await ScreenshotCRUD.get_by_test_run_id(db, test_run_id)
        
        # Calculate summary metrics
        summary = {
            "test_run_id": test_run.id,
            "metadata_id": test_run.metadata_id,
            "status": test_run.status,
            "duration_seconds": None,
            "fields_tested": 0,
            "fields_passed": 0,
            "fields_failed": 0,
            "screenshot_count": len(screenshots),
            "screenshot_types": list(set(s.screenshot_type for s in screenshots)),
            "has_errors": bool(test_run.error_message),
            "error_message": test_run.error_message,
            "started_at": test_run.started_at,
            "completed_at": test_run.completed_at
        }
        
        # Calculate duration if completed
        if test_run.started_at and test_run.completed_at:
            duration = test_run.completed_at - test_run.started_at
            summary["duration_seconds"] = duration.total_seconds()
        
        # Analyze test results if available
        if test_run.test_results:
            results = test_run.test_results
            if isinstance(results, dict):
                field_results = results.get("field_results", {})
                summary["fields_tested"] = len(field_results)
                summary["fields_passed"] = sum(1 for result in field_results.values() 
                                             if result.get("status") == "passed")
                summary["fields_failed"] = summary["fields_tested"] - summary["fields_passed"]
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating test summary for {test_run_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate test summary: {str(e)}"
        )
