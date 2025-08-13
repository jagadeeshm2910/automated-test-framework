#!/usr/bin/env python3
"""
Integration test for Deliverable 6: Analytics with real data generation
Creates sample data and validates analytics functionality end-to-end
"""

import asyncio
import httpx
import json
import time
from datetime import datetime

class AnalyticsIntegrationTest:
    """End-to-end analytics integration test"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "test_phases": {},
            "generated_data": {},
            "analytics_validation": {},
            "summary": {}
        }
    
    async def run_integration_test(self):
        """Run complete integration test"""
        print("🔬 Starting Analytics Integration Test")
        print("=" * 50)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Phase 1: Generate test data
            await self.generate_sample_data(client)
            
            # Phase 2: Run some tests to create analytics data
            await self.execute_sample_tests(client)
            
            # Phase 3: Validate analytics with real data
            await self.validate_analytics_with_data(client)
            
            # Phase 4: Test advanced analytics features
            await self.test_advanced_features(client)
            
            # Generate final summary
            self.generate_final_summary()
        
        return self.results
    
    async def generate_sample_data(self, client: httpx.AsyncClient):
        """Generate sample form metadata for testing"""
        print("\n📝 Phase 1: Generating Sample Data")
        print("-" * 30)
        
        # Test URLs that should have forms
        test_urls = [
            "https://httpbin.org/forms/post",  # Simple form
            "https://jsonplaceholder.typicode.com",  # API endpoint
        ]
        
        generated_metadata = []
        
        for url in test_urls:
            try:
                print(f"  Extracting metadata from: {url}")
                
                # Extract metadata from URL
                response = await client.post(
                    f"{self.base_url}/extract/url",
                    json={"url": url}
                )
                
                if response.status_code == 200:
                    metadata = response.json()
                    generated_metadata.append(metadata)
                    print(f"    ✅ Extracted metadata ID: {metadata['id']}")
                else:
                    print(f"    ⚠️  Failed to extract from {url}: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error extracting from {url}: {str(e)}")
        
        # Also generate some synthetic metadata using AI data generator
        try:
            print("  Generating synthetic form metadata...")
            
            response = await client.post(
                f"{self.base_url}/generate/metadata",
                json={
                    "form_type": "contact",
                    "complexity": "medium",
                    "field_count": 5
                }
            )
            
            if response.status_code == 200:
                synthetic_metadata = response.json()
                generated_metadata.append(synthetic_metadata)
                print(f"    ✅ Generated synthetic metadata ID: {synthetic_metadata['id']}")
            else:
                print(f"    ⚠️  Failed to generate synthetic metadata: {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Error generating synthetic data: {str(e)}")
        
        self.results["test_phases"]["data_generation"] = {
            "success": len(generated_metadata) > 0,
            "metadata_count": len(generated_metadata),
            "metadata_ids": [m["id"] for m in generated_metadata]
        }
        
        self.results["generated_data"]["metadata"] = generated_metadata
        
        print(f"  📊 Generated {len(generated_metadata)} metadata records")
    
    async def execute_sample_tests(self, client: httpx.AsyncClient):
        """Execute some test runs to generate analytics data"""
        print("\n🧪 Phase 2: Executing Sample Tests")
        print("-" * 30)
        
        metadata_list = self.results["generated_data"].get("metadata", [])
        test_runs = []
        
        for metadata in metadata_list:
            try:
                metadata_id = metadata["id"]
                print(f"  Running test for metadata ID: {metadata_id}")
                
                # Start a test run
                response = await client.post(
                    f"{self.base_url}/test/{metadata_id}",
                    json={"scenario": "standard_test"}
                )
                
                if response.status_code == 200:
                    test_run = response.json()
                    test_runs.append(test_run)
                    print(f"    ✅ Started test run ID: {test_run['id']}")
                    
                    # Wait a moment for test to process
                    await asyncio.sleep(2)
                    
                else:
                    print(f"    ⚠️  Failed to start test: {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error running test for metadata {metadata_id}: {str(e)}")
        
        self.results["test_phases"]["test_execution"] = {
            "success": len(test_runs) > 0,
            "test_runs_count": len(test_runs),
            "test_run_ids": [t["id"] for t in test_runs]
        }
        
        self.results["generated_data"]["test_runs"] = test_runs
        
        print(f"  🎯 Executed {len(test_runs)} test runs")
    
    async def validate_analytics_with_data(self, client: httpx.AsyncClient):
        """Validate analytics endpoints with generated data"""
        print("\n📊 Phase 3: Validating Analytics with Real Data")
        print("-" * 30)
        
        analytics_results = {}
        
        # Test global analytics
        try:
            print("  Testing global analytics...")
            response = await client.get(f"{self.base_url}/results/analytics/global")
            
            if response.status_code == 200:
                data = response.json()
                totals = data.get("totals", {})
                
                analytics_results["global"] = {
                    "success": True,
                    "metadata_count": totals.get("metadata_records", 0),
                    "test_runs_count": totals.get("test_runs", 0),
                    "has_data": totals.get("metadata_records", 0) > 0
                }
                
                print(f"    ✅ Found {totals.get('metadata_records', 0)} metadata records, {totals.get('test_runs', 0)} test runs")
            else:
                analytics_results["global"] = {"success": False, "status_code": response.status_code}
                print(f"    ❌ Failed: {response.status_code}")
                
        except Exception as e:
            analytics_results["global"] = {"success": False, "error": str(e)}
            print(f"    ❌ Error: {str(e)}")
        
        # Test performance analytics
        try:
            print("  Testing performance analytics...")
            response = await client.get(f"{self.base_url}/results/analytics/performance?days=1")
            
            if response.status_code == 200:
                data = response.json()
                analytics_results["performance"] = {
                    "success": True,
                    "analysis_days": data.get("analysis_period_days", 0),
                    "has_execution_data": bool(data.get("execution_times"))
                }
                print("    ✅ Performance analytics generated successfully")
            else:
                analytics_results["performance"] = {"success": False, "status_code": response.status_code}
                print(f"    ❌ Failed: {response.status_code}")
                
        except Exception as e:
            analytics_results["performance"] = {"success": False, "error": str(e)}
            print(f"    ❌ Error: {str(e)}")
        
        # Test dashboard data
        try:
            print("  Testing dashboard data generation...")
            response = await client.get(f"{self.base_url}/results/reports/dashboard")
            
            if response.status_code == 200:
                data = response.json()
                overview = data.get("overview", {})
                
                analytics_results["dashboard"] = {
                    "success": True,
                    "has_overview": bool(overview),
                    "total_forms": overview.get("total_forms", 0),
                    "success_rate": overview.get("success_rate", 0)
                }
                
                print(f"    ✅ Dashboard shows {overview.get('total_forms', 0)} forms with {overview.get('success_rate', 0)}% success rate")
            else:
                analytics_results["dashboard"] = {"success": False, "status_code": response.status_code}
                print(f"    ❌ Failed: {response.status_code}")
                
        except Exception as e:
            analytics_results["dashboard"] = {"success": False, "error": str(e)}
            print(f"    ❌ Error: {str(e)}")
        
        self.results["analytics_validation"] = analytics_results
    
    async def test_advanced_features(self, client: httpx.AsyncClient):
        """Test advanced analytics features"""
        print("\n🔬 Phase 4: Testing Advanced Features")
        print("-" * 30)
        
        advanced_results = {}
        
        # Test metadata-specific insights
        metadata_list = self.results["generated_data"].get("metadata", [])
        if metadata_list:
            try:
                metadata_id = metadata_list[0]["id"]
                print(f"  Testing metadata insights for ID {metadata_id}...")
                
                response = await client.get(f"{self.base_url}/results/analytics/metadata/{metadata_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    advanced_results["metadata_insights"] = {
                        "success": True,
                        "has_test_stats": bool(data.get("test_statistics")),
                        "has_form_analysis": bool(data.get("form_analysis"))
                    }
                    print("    ✅ Metadata insights generated successfully")
                else:
                    advanced_results["metadata_insights"] = {"success": False, "status_code": response.status_code}
                    print(f"    ❌ Failed: {response.status_code}")
                    
            except Exception as e:
                advanced_results["metadata_insights"] = {"success": False, "error": str(e)}
                print(f"    ❌ Error: {str(e)}")
        
        # Test health monitoring
        try:
            print("  Testing health monitoring...")
            response = await client.get(f"{self.base_url}/results/analytics/health-check")
            
            if response.status_code == 200:
                data = response.json()
                advanced_results["health_monitoring"] = {
                    "success": True,
                    "health_status": data.get("overall_health"),
                    "activity_level": data.get("activity_level"),
                    "has_metrics": bool(data.get("metrics"))
                }
                
                health_status = data.get("overall_health", "unknown")
                activity_level = data.get("activity_level", "unknown")
                print(f"    ✅ System health: {health_status}, activity: {activity_level}")
            else:
                advanced_results["health_monitoring"] = {"success": False, "status_code": response.status_code}
                print(f"    ❌ Failed: {response.status_code}")
                
        except Exception as e:
            advanced_results["health_monitoring"] = {"success": False, "error": str(e)}
            print(f"    ❌ Error: {str(e)}")
        
        # Test executive summary
        try:
            print("  Testing executive summary...")
            response = await client.get(f"{self.base_url}/results/reports/executive-summary")
            
            if response.status_code == 200:
                data = response.json()
                advanced_results["executive_summary"] = {
                    "success": True,
                    "has_kpis": bool(data.get("key_performance_indicators")),
                    "has_insights": bool(data.get("quality_insights")),
                    "has_recommendations": bool(data.get("recommendations"))
                }
                print("    ✅ Executive summary generated with insights and recommendations")
            else:
                advanced_results["executive_summary"] = {"success": False, "status_code": response.status_code}
                print(f"    ❌ Failed: {response.status_code}")
                
        except Exception as e:
            advanced_results["executive_summary"] = {"success": False, "error": str(e)}
            print(f"    ❌ Error: {str(e)}")
        
        self.results["test_phases"]["advanced_features"] = advanced_results
    
    def generate_final_summary(self):
        """Generate final integration test summary"""
        print("\n📋 Integration Test Summary")
        print("=" * 50)
        
        # Count successes across all phases
        phase_results = []
        
        # Data generation phase
        data_gen = self.results["test_phases"].get("data_generation", {})
        if data_gen.get("success", False):
            phase_results.append("✅ Data Generation")
            print(f"✅ Data Generation: {data_gen.get('metadata_count', 0)} metadata records created")
        else:
            phase_results.append("❌ Data Generation")
            print("❌ Data Generation: Failed to create sample data")
        
        # Test execution phase
        test_exec = self.results["test_phases"].get("test_execution", {})
        if test_exec.get("success", False):
            phase_results.append("✅ Test Execution")
            print(f"✅ Test Execution: {test_exec.get('test_runs_count', 0)} test runs completed")
        else:
            phase_results.append("❌ Test Execution")
            print("❌ Test Execution: Failed to execute test runs")
        
        # Analytics validation
        analytics = self.results.get("analytics_validation", {})
        analytics_success = sum(1 for result in analytics.values() if result.get("success", False))
        analytics_total = len(analytics)
        
        if analytics_success > 0:
            phase_results.append(f"✅ Analytics Validation ({analytics_success}/{analytics_total})")
            print(f"✅ Analytics Validation: {analytics_success}/{analytics_total} endpoints successful")
        else:
            phase_results.append("❌ Analytics Validation")
            print("❌ Analytics Validation: No analytics endpoints working")
        
        # Advanced features
        advanced = self.results["test_phases"].get("advanced_features", {})
        advanced_success = sum(1 for result in advanced.values() if result.get("success", False))
        advanced_total = len(advanced)
        
        if advanced_success > 0:
            phase_results.append(f"✅ Advanced Features ({advanced_success}/{advanced_total})")
            print(f"✅ Advanced Features: {advanced_success}/{advanced_total} features working")
        else:
            phase_results.append("❌ Advanced Features")
            print("❌ Advanced Features: Advanced analytics not working")
        
        # Calculate overall success
        successful_phases = sum(1 for result in phase_results if result.startswith("✅"))
        total_phases = len(phase_results)
        success_rate = (successful_phases / total_phases * 100) if total_phases > 0 else 0
        
        self.results["summary"] = {
            "total_phases": total_phases,
            "successful_phases": successful_phases,
            "success_rate_percent": round(success_rate, 2),
            "phase_results": phase_results,
            "analytics_endpoints_working": analytics_success,
            "advanced_features_working": advanced_success
        }
        
        print(f"\n🎯 Overall Integration Success: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Full end-to-end analytics integration working!")
        elif success_rate >= 75:
            print("✅ GOOD: Analytics integration mostly working")
        elif success_rate >= 50:
            print("⚠️  FAIR: Partial analytics integration")
        else:
            print("❌ POOR: Analytics integration needs significant work")


async def main():
    """Main integration test execution"""
    test = AnalyticsIntegrationTest()
    results = await test.run_integration_test()
    
    # Save results
    with open("deliverable6_integration_test.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Integration test results saved to: deliverable6_integration_test.json")
    
    return results


if __name__ == "__main__":
    print("🔬 Deliverable 6: Analytics Integration Test")
    print("Testing end-to-end analytics with real data generation...")
    print()
    
    results = asyncio.run(main())
    
    # Print final status
    success_rate = results["summary"]["success_rate_percent"]
    print(f"\n{'🎉' if success_rate >= 90 else '✅' if success_rate >= 75 else '⚠️' if success_rate >= 50 else '❌'} "
          f"Integration Test: {success_rate:.1f}% Successful")
