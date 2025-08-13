"""
Analytics Service for UI Testing Framework
Provides comprehensive analytics, metrics, and reporting capabilities
"""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, and_, or_
from app.models import FieldMetadata, TestRun, Screenshot
from app.models.schemas import TestStatus, FieldType, SourceType
from app.models.crud import TestRunCRUD, MetadataCRUD, ScreenshotCRUD
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Comprehensive analytics service for UI testing metrics and insights
    """
    
    @staticmethod
    async def get_global_metrics(db: AsyncSession) -> Dict[str, Any]:
        """
        Get global system metrics and statistics
        
        Returns overall system health and usage statistics
        """
        try:
            # Basic counts
            total_metadata = await db.execute(select(func.count(FieldMetadata.id)))
            total_test_runs = await db.execute(select(func.count(TestRun.id)))
            total_screenshots = await db.execute(select(func.count(Screenshot.id)))
            
            # Status breakdown
            completed_runs = await db.execute(
                select(func.count(TestRun.id)).where(TestRun.status == TestStatus.COMPLETED)
            )
            failed_runs = await db.execute(
                select(func.count(TestRun.id)).where(TestRun.status == TestStatus.FAILED)
            )
            pending_runs = await db.execute(
                select(func.count(TestRun.id)).where(TestRun.status == TestStatus.PENDING)
            )
            running_runs = await db.execute(
                select(func.count(TestRun.id)).where(TestRun.status == TestStatus.RUNNING)
            )
            
            # Source type breakdown
            web_pages = await db.execute(
                select(func.count(FieldMetadata.id)).where(FieldMetadata.source_type == SourceType.WEB_PAGE)
            )
            github_repos = await db.execute(
                select(func.count(FieldMetadata.id)).where(FieldMetadata.source_type == SourceType.GITHUB_REPOSITORY)
            )
            
            # Recent activity (last 7 days)
            week_ago = datetime.utcnow() - timedelta(days=7)
            recent_test_runs = await db.execute(
                select(func.count(TestRun.id)).where(TestRun.created_at >= week_ago)
            )
            recent_metadata = await db.execute(
                select(func.count(FieldMetadata.id)).where(FieldMetadata.created_at >= week_ago)
            )
            
            # Calculate success rate
            total_completed = completed_runs.scalar()
            total_failed = failed_runs.scalar()
            total_finished = total_completed + total_failed
            success_rate = (total_completed / total_finished * 100) if total_finished > 0 else 0
            
            return {
                "totals": {
                    "metadata_records": total_metadata.scalar(),
                    "test_runs": total_test_runs.scalar(),
                    "screenshots": total_screenshots.scalar()
                },
                "test_run_status": {
                    "completed": total_completed,
                    "failed": total_failed,
                    "pending": pending_runs.scalar(),
                    "running": running_runs.scalar(),
                    "success_rate_percent": round(success_rate, 2)
                },
                "source_types": {
                    "web_pages": web_pages.scalar(),
                    "github_repositories": github_repos.scalar()
                },
                "recent_activity": {
                    "test_runs_last_7_days": recent_test_runs.scalar(),
                    "metadata_created_last_7_days": recent_metadata.scalar()
                },
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating global metrics: {str(e)}")
            raise
    
    @staticmethod
    async def get_performance_metrics(db: AsyncSession, days: int = 30) -> Dict[str, Any]:
        """
        Get performance metrics and trends over time
        
        Args:
            days: Number of days to analyze (default: 30)
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get completed test runs with timing data
            completed_runs = await db.execute(
                select(TestRun).where(
                    and_(
                        TestRun.status == TestStatus.COMPLETED,
                        TestRun.created_at >= cutoff_date,
                        TestRun.started_at.isnot(None),
                        TestRun.completed_at.isnot(None)
                    )
                ).order_by(TestRun.created_at.desc())
            )
            
            runs = completed_runs.scalars().all()
            
            if not runs:
                return {
                    "analysis_period_days": days,
                    "total_runs_analyzed": 0,
                    "message": "No completed test runs found in the specified period"
                }
            
            # Calculate performance metrics
            durations = []
            daily_counts = {}
            
            for run in runs:
                if run.started_at and run.completed_at:
                    duration = (run.completed_at - run.started_at).total_seconds()
                    durations.append(duration)
                    
                    # Group by day
                    day_key = run.created_at.date().isoformat()
                    daily_counts[day_key] = daily_counts.get(day_key, 0) + 1
            
            # Statistical analysis
            avg_duration = sum(durations) / len(durations) if durations else 0
            min_duration = min(durations) if durations else 0
            max_duration = max(durations) if durations else 0
            
            # Sort daily counts for trending
            sorted_daily = sorted(daily_counts.items())
            
            return {
                "analysis_period_days": days,
                "total_runs_analyzed": len(runs),
                "execution_times": {
                    "average_seconds": round(avg_duration, 2),
                    "minimum_seconds": round(min_duration, 2),
                    "maximum_seconds": round(max_duration, 2),
                    "median_seconds": round(sorted(durations)[len(durations)//2], 2) if durations else 0
                },
                "daily_activity": sorted_daily,
                "trend_analysis": {
                    "most_active_day": max(daily_counts.items(), key=lambda x: x[1]) if daily_counts else None,
                    "total_days_with_activity": len(daily_counts),
                    "average_runs_per_day": round(len(runs) / days, 2)
                },
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating performance metrics: {str(e)}")
            raise
    
    @staticmethod
    async def get_field_type_analytics(db: AsyncSession) -> Dict[str, Any]:
        """
        Analyze field type usage and success rates
        """
        try:
            # Get all metadata with fields data
            metadata_query = await db.execute(
                select(FieldMetadata).where(FieldMetadata.fields_data.isnot(None))
            )
            metadata_records = metadata_query.scalars().all()
            
            field_type_stats = {}
            total_fields = 0
            
            for metadata in metadata_records:
                if metadata.fields_data:
                    for field_data in metadata.fields_data:
                        field_type = field_data.get("type", "unknown")
                        field_id = field_data.get("field_id", "unknown")
                        
                        if field_type not in field_type_stats:
                            field_type_stats[field_type] = {
                                "count": 0,
                                "test_attempts": 0,
                                "test_successes": 0,
                                "success_rate": 0,
                                "field_ids": []
                            }
                        
                        field_type_stats[field_type]["count"] += 1
                        field_type_stats[field_type]["field_ids"].append(field_id)
                        total_fields += 1
            
            # Calculate test success rates for each field type
            # This would require analyzing test results, but for now we'll provide field counts
            
            # Sort by frequency
            sorted_types = sorted(field_type_stats.items(), key=lambda x: x[1]["count"], reverse=True)
            
            return {
                "total_fields_analyzed": total_fields,
                "unique_field_types": len(field_type_stats),
                "field_type_distribution": dict(sorted_types),
                "most_common_types": sorted_types[:5],
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating field type analytics: {str(e)}")
            raise
    
    @staticmethod
    async def get_failure_analysis(db: AsyncSession, limit: int = 10) -> Dict[str, Any]:
        """
        Analyze test failures to identify patterns
        
        Args:
            limit: Maximum number of failed runs to analyze
        """
        try:
            # Get recent failed test runs
            failed_runs_query = await db.execute(
                select(TestRun).where(TestRun.status == TestStatus.FAILED)
                .order_by(TestRun.created_at.desc())
                .limit(limit)
            )
            failed_runs = failed_runs_query.scalars().all()
            
            if not failed_runs:
                return {
                    "total_failures_analyzed": 0,
                    "message": "No failed test runs found"
                }
            
            # Analyze failure patterns
            error_categories = {}
            failure_by_metadata = {}
            
            for run in failed_runs:
                # Categorize errors
                error_msg = run.error_message or "Unknown error"
                
                # Simple error categorization
                if "timeout" in error_msg.lower():
                    category = "timeout"
                elif "element not found" in error_msg.lower():
                    category = "element_not_found"
                elif "network" in error_msg.lower():
                    category = "network_error"
                elif "javascript" in error_msg.lower():
                    category = "javascript_error"
                else:
                    category = "other"
                
                error_categories[category] = error_categories.get(category, 0) + 1
                
                # Track failures by metadata
                metadata_id = run.metadata_id
                if metadata_id not in failure_by_metadata:
                    failure_by_metadata[metadata_id] = 0
                failure_by_metadata[metadata_id] += 1
            
            # Find most problematic metadata
            most_problematic = sorted(failure_by_metadata.items(), key=lambda x: x[1], reverse=True)
            
            return {
                "total_failures_analyzed": len(failed_runs),
                "error_categories": error_categories,
                "most_common_error": max(error_categories.items(), key=lambda x: x[1]) if error_categories else None,
                "problematic_metadata": most_problematic[:5],
                "recent_failures": [
                    {
                        "test_run_id": run.id,
                        "metadata_id": run.metadata_id,
                        "error_message": run.error_message,
                        "failed_at": run.completed_at or run.created_at
                    }
                    for run in failed_runs[:5]
                ],
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating failure analysis: {str(e)}")
            raise
    
    @staticmethod
    async def get_metadata_insights(db: AsyncSession, metadata_id: int) -> Dict[str, Any]:
        """
        Get detailed insights for a specific metadata record
        
        Args:
            metadata_id: ID of the metadata to analyze
        """
        try:
            # Get metadata and all its test runs
            metadata = await MetadataCRUD.get_by_id(db, metadata_id)
            if not metadata:
                raise ValueError(f"Metadata {metadata_id} not found")
            
            test_runs = await TestRunCRUD.get_by_metadata_id(db, metadata_id)
            
            # Analyze test runs
            total_runs = len(test_runs)
            completed_runs = [r for r in test_runs if r.status == TestStatus.COMPLETED]
            failed_runs = [r for r in test_runs if r.status == TestStatus.FAILED]
            
            # Calculate metrics
            success_rate = (len(completed_runs) / total_runs * 100) if total_runs > 0 else 0
            
            # Execution time analysis
            durations = []
            for run in completed_runs:
                if run.started_at and run.completed_at:
                    duration = (run.completed_at - run.started_at).total_seconds()
                    durations.append(duration)
            
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            # Field analysis
            field_count = len(metadata.fields_data) if metadata.fields_data else 0
            field_types = [field.get("type", "unknown") for field in metadata.fields_data] if metadata.fields_data else []
            field_type_counts = {}
            for field_type in field_types:
                field_type_counts[field_type] = field_type_counts.get(field_type, 0) + 1
            
            return {
                "metadata_id": metadata_id,
                "page_url": metadata.page_url,
                "source_type": metadata.source_type,
                "created_at": metadata.created_at,
                "test_statistics": {
                    "total_test_runs": total_runs,
                    "completed_runs": len(completed_runs),
                    "failed_runs": len(failed_runs),
                    "success_rate_percent": round(success_rate, 2)
                },
                "performance": {
                    "average_execution_seconds": round(avg_duration, 2),
                    "fastest_execution": round(min(durations), 2) if durations else 0,
                    "slowest_execution": round(max(durations), 2) if durations else 0
                },
                "form_analysis": {
                    "total_fields": field_count,
                    "field_type_distribution": field_type_counts,
                    "complexity_score": field_count  # Simple complexity based on field count
                },
                "recent_test_runs": [
                    {
                        "id": run.id,
                        "status": run.status,
                        "created_at": run.created_at,
                        "completed_at": run.completed_at
                    }
                    for run in sorted(test_runs, key=lambda x: x.created_at, reverse=True)[:5]
                ],
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating metadata insights for {metadata_id}: {str(e)}")
            raise
    
    @staticmethod
    async def get_screenshot_analytics(db: AsyncSession) -> Dict[str, Any]:
        """
        Analyze screenshot capture patterns and storage
        """
        try:
            # Get all screenshots
            screenshots_query = await db.execute(select(Screenshot))
            screenshots = screenshots_query.scalars().all()
            
            if not screenshots:
                return {
                    "total_screenshots": 0,
                    "message": "No screenshots found"
                }
            
            # Analyze by type
            type_counts = {}
            size_stats = []
            
            for screenshot in screenshots:
                screenshot_type = screenshot.screenshot_type
                type_counts[screenshot_type] = type_counts.get(screenshot_type, 0) + 1
                
                if screenshot.file_size:
                    size_stats.append(screenshot.file_size)
            
            # Calculate storage metrics
            total_storage = sum(size_stats) if size_stats else 0
            avg_size = total_storage / len(size_stats) if size_stats else 0
            
            return {
                "total_screenshots": len(screenshots),
                "type_distribution": type_counts,
                "storage_metrics": {
                    "total_storage_bytes": total_storage,
                    "total_storage_mb": round(total_storage / (1024 * 1024), 2),
                    "average_file_size_bytes": round(avg_size, 2),
                    "largest_file_bytes": max(size_stats) if size_stats else 0,
                    "smallest_file_bytes": min(size_stats) if size_stats else 0
                },
                "generated_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error generating screenshot analytics: {str(e)}")
            raise


class ReportingService:
    """
    Service for generating comprehensive reports
    """
    
    @staticmethod
    async def generate_executive_summary(db: AsyncSession) -> Dict[str, Any]:
        """
        Generate an executive summary report with key metrics
        """
        try:
            analytics = AnalyticsService()
            
            # Gather all major metrics
            global_metrics = await analytics.get_global_metrics(db)
            performance_metrics = await analytics.get_performance_metrics(db, days=30)
            field_analytics = await analytics.get_field_type_analytics(db)
            failure_analysis = await analytics.get_failure_analysis(db, limit=20)
            screenshot_analytics = await analytics.get_screenshot_analytics(db)
            
            # Create executive summary
            summary = {
                "report_type": "executive_summary",
                "report_period": "last_30_days",
                "generated_at": datetime.utcnow(),
                "key_metrics": {
                    "total_test_automation_runs": global_metrics["totals"]["test_runs"],
                    "success_rate_percent": global_metrics["test_run_status"]["success_rate_percent"],
                    "forms_under_test": global_metrics["totals"]["metadata_records"],
                    "test_evidence_screenshots": global_metrics["totals"]["screenshots"]
                },
                "performance_summary": {
                    "average_test_duration_seconds": performance_metrics.get("execution_times", {}).get("average_seconds", 0),
                    "tests_completed_last_30_days": performance_metrics.get("total_runs_analyzed", 0),
                    "system_reliability_percent": global_metrics["test_run_status"]["success_rate_percent"]
                },
                "testing_scope": {
                    "unique_field_types_tested": field_analytics.get("unique_field_types", 0),
                    "most_tested_field_type": field_analytics.get("most_common_types", [("unknown", {"count": 0})])[0][0] if field_analytics.get("most_common_types") else "none",
                    "web_pages_tested": global_metrics["source_types"]["web_pages"],
                    "github_repositories_tested": global_metrics["source_types"]["github_repositories"]
                },
                "quality_insights": {
                    "failure_rate_percent": 100 - global_metrics["test_run_status"]["success_rate_percent"],
                    "most_common_failure_type": failure_analysis.get("most_common_error", ("unknown", 0))[0] if failure_analysis.get("most_common_error") else "none",
                    "total_test_evidence_mb": screenshot_analytics.get("storage_metrics", {}).get("total_storage_mb", 0)
                },
                "recommendations": await ReportingService._generate_recommendations(
                    global_metrics, performance_metrics, failure_analysis
                )
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {str(e)}")
            raise
    
    @staticmethod
    async def _generate_recommendations(
        global_metrics: Dict, 
        performance_metrics: Dict, 
        failure_analysis: Dict
    ) -> List[str]:
        """
        Generate actionable recommendations based on analytics
        """
        recommendations = []
        
        # Success rate recommendations
        success_rate = global_metrics["test_run_status"]["success_rate_percent"]
        if success_rate < 90:
            recommendations.append(f"Test success rate is {success_rate:.1f}%. Consider investigating common failure patterns.")
        
        # Performance recommendations
        avg_duration = performance_metrics.get("execution_times", {}).get("average_seconds", 0)
        if avg_duration > 60:
            recommendations.append(f"Average test duration is {avg_duration:.1f} seconds. Consider optimizing test execution.")
        
        # Failure pattern recommendations
        if failure_analysis.get("error_categories"):
            most_common_error = failure_analysis.get("most_common_error")
            if most_common_error:
                error_type, count = most_common_error
                recommendations.append(f"Most common error type is '{error_type}' ({count} occurrences). Focus on addressing these issues.")
        
        # Activity recommendations
        recent_activity = global_metrics["recent_activity"]["test_runs_last_7_days"]
        if recent_activity == 0:
            recommendations.append("No test runs in the last 7 days. Consider increasing testing frequency.")
        
        if not recommendations:
            recommendations.append("System is performing well. Continue monitoring for any emerging patterns.")
        
        return recommendations
