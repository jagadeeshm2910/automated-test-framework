#!/usr/bin/env python3
"""
Quick validation script for analytics service functionality
Tests core analytics methods without requiring a running server
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.database import get_db
from app.services.analytics_service import AnalyticsService, ReportingService

async def test_analytics_service():
    """Test analytics service functionality"""
    print("🧪 Testing Analytics Service Core Functionality")
    print("=" * 50)
    
    try:
        # Initialize analytics service
        analytics = AnalyticsService()
        reporting = ReportingService()
        
        print("✅ Analytics services initialized successfully")
        
        # Test database connection
        async for db in get_db():
            print("✅ Database connection established")
            
            try:
                # Test global metrics
                print("\n📊 Testing global metrics...")
                global_metrics = await analytics.get_global_metrics(db)
                print(f"   ✅ Global metrics: {len(global_metrics)} sections")
                
                # Test performance metrics
                print("\n⚡ Testing performance metrics...")
                performance_metrics = await analytics.get_performance_metrics(db, days=7)
                print(f"   ✅ Performance metrics: {len(performance_metrics)} sections")
                
                # Test failure analysis
                print("\n🔍 Testing failure analysis...")
                failure_analysis = await analytics.get_failure_analysis(db, limit=10)
                print(f"   ✅ Failure analysis: {len(failure_analysis)} sections")
                
                # Test screenshot analytics
                print("\n📷 Testing screenshot analytics...")
                screenshot_analytics = await analytics.get_screenshot_analytics(db)
                print(f"   ✅ Screenshot analytics: {len(screenshot_analytics)} sections")
                
                # Test field type analytics
                print("\n📝 Testing field type analytics...")
                field_analytics = await analytics.get_field_type_analytics(db)
                print(f"   ✅ Field type analytics: {len(field_analytics)} sections")
                
                # Test executive summary
                print("\n📋 Testing executive summary...")
                exec_summary = await reporting.generate_executive_summary(db)
                print(f"   ✅ Executive summary: {len(exec_summary)} sections")
                
                print("\n🎉 All analytics service tests passed!")
                
                return True
                
            except Exception as e:
                print(f"❌ Error testing analytics methods: {str(e)}")
                return False
            
            finally:
                break  # Exit the async generator
                
    except Exception as e:
        print(f"❌ Error initializing analytics service: {str(e)}")
        return False

async def main():
    """Main test function"""
    success = await test_analytics_service()
    
    if success:
        print("\n✅ Analytics service validation: PASSED")
        print("📊 Deliverable 6 core functionality is working!")
    else:
        print("\n❌ Analytics service validation: FAILED")
        print("🔧 Deliverable 6 needs debugging")
    
    return success

if __name__ == "__main__":
    print("🔬 Quick Analytics Service Validation")
    print("Testing core analytics functionality...\n")
    
    success = asyncio.run(main())
    
    if success:
        print("\n🎯 Ready to test full analytics API endpoints!")
    else:
        print("\n🛠️  Fix core issues before testing API endpoints")
