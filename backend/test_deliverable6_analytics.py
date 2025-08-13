#!/usr/bin/env python3
"""
Comprehensive test script for Deliverable 6: Results API & Analytics
Tests all analytics endpoints and validates comprehensive reporting capabilities
"""

import asyncio
import httpx
import json
import time
from datetime import datetime
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 30.0

class AnalyticsValidator:
    """Comprehensive analytics and reporting validation"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "analytics_endpoints": {},
            "reporting_endpoints": {},
            "advanced_analytics": {},
            "health_checks": {},
            "data_quality": {},
            "summary": {}
        }
    
    async def run_validation(self):
        """Run complete validation suite"""
        print("🚀 Starting Deliverable 6: Analytics & Reporting Validation")
        print("=" * 60)
        
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            # Test core analytics endpoints
            await self.test_analytics_endpoints(client)
            
            # Test reporting capabilities
            await self.test_reporting_endpoints(client)
            
            # Test advanced analytics
            await self.test_advanced_analytics(client)
            
            # Test health monitoring
            await self.test_health_monitoring(client)
            
            # Validate data quality
            await self.validate_data_quality(client)
            
            # Generate summary
            self.generate_summary()
        
        return self.results
    
    async def test_analytics_endpoints(self, client: httpx.AsyncClient):
        """Test core analytics endpoints"""
        print("\n📊 Testing Core Analytics Endpoints")
        print("-" * 40)
        
        endpoints = [
            ("global", "/results/analytics/global"),
            ("performance", "/results/analytics/performance"),
            ("field_types", "/results/analytics/field-types"), 
            ("failures", "/results/analytics/failures"),
            ("screenshots", "/results/analytics/screenshots")
        ]
        
        for name, endpoint in endpoints:
            try:
                print(f"  Testing {name} analytics...")
                response = await client.get(f"{BASE_URL}{endpoint}")
                
                self.results["analytics_endpoints"][name] = {
                    "status_code": response.status_code,
                    "success": response.status_code == 200,
                    "response_time_ms": response.elapsed.total_seconds() * 1000,
                    "data_keys": list(response.json().keys()) if response.status_code == 200 else [],
                    "error": response.text if response.status_code != 200 else None
                }
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"    ✅ Success - {len(data)} data sections")
                    
                    # Validate expected data structure
                    if name == "global":
                        self.validate_global_analytics(data)
                    elif name == "performance":
                        self.validate_performance_analytics(data)
                        
                else:
                    print(f"    ❌ Failed - Status {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error - {str(e)}")
                self.results["analytics_endpoints"][name] = {
                    "success": False,
                    "error": str(e)
                }
    
    async def test_reporting_endpoints(self, client: httpx.AsyncClient):
        """Test reporting capabilities"""
        print("\n📈 Testing Reporting Endpoints")
        print("-" * 40)
        
        endpoints = [
            ("executive_summary", "/results/reports/executive-summary"),
            ("dashboard", "/results/reports/dashboard")
        ]
        
        for name, endpoint in endpoints:
            try:
                print(f"  Testing {name} report...")
                response = await client.get(f"{BASE_URL}{endpoint}")
                
                self.results["reporting_endpoints"][name] = {
                    "status_code": response.status_code,
                    "success": response.status_code == 200,
                    "response_time_ms": response.elapsed.total_seconds() * 1000,
                    "data_keys": list(response.json().keys()) if response.status_code == 200 else [],
                    "error": response.text if response.status_code != 200 else None
                }
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"    ✅ Success - Generated comprehensive report")
                    
                    if name == "dashboard":
                        self.validate_dashboard_data(data)
                    elif name == "executive_summary":
                        self.validate_executive_summary(data)
                        
                else:
                    print(f"    ❌ Failed - Status {response.status_code}")
                    
            except Exception as e:
                print(f"    ❌ Error - {str(e)}")
                self.results["reporting_endpoints"][name] = {
                    "success": False,
                    "error": str(e)
                }
    
    async def test_advanced_analytics(self, client: httpx.AsyncClient):
        """Test advanced analytics endpoints"""
        print("\n🔬 Testing Advanced Analytics")
        print("-" * 40)
        
        # Test success rate trends
        try:
            print("  Testing success rate trends...")
            response = await client.get(f"{BASE_URL}/results/analytics/trends/success-rate?days=7")
            
            self.results["advanced_analytics"]["success_trends"] = {
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ Success - {len(data.get('daily_success_rates', []))} days analyzed")
            else:
                print(f"    ❌ Failed - Status {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Error - {str(e)}")
            self.results["advanced_analytics"]["success_trends"] = {"success": False, "error": str(e)}
        
        # Test metadata comparison (if we have metadata)
        try:
            print("  Testing metadata comparison...")
            # First get some metadata IDs
            metadata_response = await client.get(f"{BASE_URL}/metadata")
            
            if metadata_response.status_code == 200:
                metadata_list = metadata_response.json()
                if metadata_list:
                    # Use first two metadata IDs for comparison
                    ids = [str(item["id"]) for item in metadata_list[:2]]
                    if len(ids) >= 1:
                        comparison_url = f"{BASE_URL}/results/analytics/comparison/metadata?metadata_ids={','.join(ids)}"
                        response = await client.get(comparison_url)
                        
                        self.results["advanced_analytics"]["metadata_comparison"] = {
                            "status_code": response.status_code,
                            "success": response.status_code == 200,
                            "compared_items": len(ids)
                        }
                        
                        if response.status_code == 200:
                            print(f"    ✅ Success - Compared {len(ids)} metadata records")
                        else:
                            print(f"    ❌ Failed - Status {response.status_code}")
                    else:
                        print("    ⚠️  Skipped - No metadata available for comparison")
                        self.results["advanced_analytics"]["metadata_comparison"] = {"skipped": "no_metadata"}
                else:
                    print("    ⚠️  Skipped - No metadata records found")
                    self.results["advanced_analytics"]["metadata_comparison"] = {"skipped": "no_metadata"}
            else:
                print("    ⚠️  Skipped - Could not fetch metadata list")
                self.results["advanced_analytics"]["metadata_comparison"] = {"skipped": "metadata_fetch_failed"}
                
        except Exception as e:
            print(f"    ❌ Error - {str(e)}")
            self.results["advanced_analytics"]["metadata_comparison"] = {"success": False, "error": str(e)}
    
    async def test_health_monitoring(self, client: httpx.AsyncClient):
        """Test health monitoring capabilities"""
        print("\n💚 Testing Health Monitoring")
        print("-" * 40)
        
        try:
            print("  Testing system health check...")
            response = await client.get(f"{BASE_URL}/results/analytics/health-check")
            
            self.results["health_checks"]["system_health"] = {
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
            
            if response.status_code == 200:
                data = response.json()
                health_status = data.get("overall_health", "unknown")
                activity_level = data.get("activity_level", "unknown")
                print(f"    ✅ Success - Health: {health_status}, Activity: {activity_level}")
                
                self.results["health_checks"]["health_indicators"] = {
                    "overall_health": health_status,
                    "activity_level": activity_level,
                    "recent_runs": data.get("metrics", {}).get("recent_test_runs_24h", 0),
                    "error_rate": data.get("metrics", {}).get("error_rate_percent", 0)
                }
            else:
                print(f"    ❌ Failed - Status {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Error - {str(e)}")
            self.results["health_checks"]["system_health"] = {"success": False, "error": str(e)}
    
    async def validate_data_quality(self, client: httpx.AsyncClient):
        """Validate data quality and consistency"""
        print("\n🔍 Validating Data Quality")
        print("-" * 40)
        
        quality_checks = {}
        
        # Check if global analytics provides reasonable data
        try:
            response = await client.get(f"{BASE_URL}/results/analytics/global")
            if response.status_code == 200:
                data = response.json()
                totals = data.get("totals", {})
                
                quality_checks["data_consistency"] = {
                    "has_totals": bool(totals),
                    "metadata_count": totals.get("metadata_records", 0),
                    "test_runs_count": totals.get("test_runs", 0),
                    "screenshots_count": totals.get("screenshots", 0)
                }
                
                print(f"    📊 Data Overview: {totals.get('metadata_records', 0)} forms, {totals.get('test_runs', 0)} test runs")
            
        except Exception as e:
            quality_checks["data_consistency"] = {"error": str(e)}
        
        # Check response times
        performance_check = {}
        try:
            start_time = time.time()
            response = await client.get(f"{BASE_URL}/results/analytics/performance")
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            performance_check["analytics_response_time_ms"] = response_time
            performance_check["acceptable_performance"] = response_time < 5000  # Under 5 seconds
            
            print(f"    ⚡ Performance: Analytics response in {response_time:.0f}ms")
            
        except Exception as e:
            performance_check["error"] = str(e)
        
        self.results["data_quality"] = {
            "quality_checks": quality_checks,
            "performance_checks": performance_check
        }
    
    def validate_global_analytics(self, data: Dict[str, Any]):
        """Validate global analytics structure"""
        expected_keys = ["totals", "test_run_status", "source_distribution", "recent_activity"]
        
        for key in expected_keys:
            if key not in data:
                print(f"    ⚠️  Missing expected key: {key}")
    
    def validate_performance_analytics(self, data: Dict[str, Any]):
        """Validate performance analytics structure"""
        expected_keys = ["analysis_period_days", "execution_times", "daily_activity"]
        
        for key in expected_keys:
            if key not in data:
                print(f"    ⚠️  Missing expected key: {key}")
    
    def validate_dashboard_data(self, data: Dict[str, Any]):
        """Validate dashboard data structure"""
        expected_sections = ["overview", "status_distribution", "performance", "quality", "trends"]
        
        for section in expected_sections:
            if section not in data:
                print(f"    ⚠️  Missing dashboard section: {section}")
    
    def validate_executive_summary(self, data: Dict[str, Any]):
        """Validate executive summary structure"""
        expected_keys = ["report_metadata", "key_performance_indicators", "quality_insights"]
        
        for key in expected_keys:
            if key not in data:
                print(f"    ⚠️  Missing summary section: {key}")
    
    def generate_summary(self):
        """Generate validation summary"""
        print("\n📋 Validation Summary")
        print("=" * 60)
        
        # Count successes
        analytics_success = sum(1 for endpoint in self.results["analytics_endpoints"].values() 
                              if endpoint.get("success", False))
        analytics_total = len(self.results["analytics_endpoints"])
        
        reporting_success = sum(1 for endpoint in self.results["reporting_endpoints"].values() 
                              if endpoint.get("success", False))
        reporting_total = len(self.results["reporting_endpoints"])
        
        advanced_success = sum(1 for endpoint in self.results["advanced_analytics"].values() 
                             if endpoint.get("success", False))
        advanced_total = len(self.results["advanced_analytics"])
        
        health_success = sum(1 for check in self.results["health_checks"].values() 
                           if check.get("success", False))
        health_total = len(self.results["health_checks"])
        
        print(f"📊 Core Analytics Endpoints: {analytics_success}/{analytics_total} successful")
        print(f"📈 Reporting Endpoints: {reporting_success}/{reporting_total} successful")
        print(f"🔬 Advanced Analytics: {advanced_success}/{advanced_total} successful")
        print(f"💚 Health Monitoring: {health_success}/{health_total} successful")
        
        total_success = analytics_success + reporting_success + advanced_success + health_success
        total_tests = analytics_total + reporting_total + advanced_total + health_total
        
        success_rate = (total_success / total_tests * 100) if total_tests > 0 else 0
        
        self.results["summary"] = {
            "total_tests": total_tests,
            "total_success": total_success,
            "success_rate_percent": round(success_rate, 2),
            "analytics_endpoints": f"{analytics_success}/{analytics_total}",
            "reporting_endpoints": f"{reporting_success}/{reporting_total}",
            "advanced_analytics": f"{advanced_success}/{advanced_total}",
            "health_monitoring": f"{health_success}/{health_total}"
        }
        
        print(f"\n🎯 Overall Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Deliverable 6 analytics implementation is comprehensive!")
        elif success_rate >= 75:
            print("✅ GOOD: Analytics implementation is solid with minor issues")
        elif success_rate >= 50:
            print("⚠️  FAIR: Analytics implementation needs some fixes")
        else:
            print("❌ POOR: Analytics implementation requires significant work")


async def main():
    """Main test execution"""
    validator = AnalyticsValidator()
    results = await validator.run_validation()
    
    # Save results
    with open("deliverable6_analytics_validation.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to: deliverable6_analytics_validation.json")
    
    return results


if __name__ == "__main__":
    print("🧪 Deliverable 6: Analytics & Reporting Validation")
    print("Testing comprehensive analytics capabilities...")
    print()
    
    results = asyncio.run(main())
    
    # Print final status
    success_rate = results["summary"]["success_rate_percent"]
    print(f"\n{'🎉' if success_rate >= 90 else '✅' if success_rate >= 75 else '⚠️' if success_rate >= 50 else '❌'} "
          f"Deliverable 6 Status: {success_rate:.1f}% Complete")
