#!/usr/bin/env python3
"""
Integration test to verify the complete API workflow
Tests the full web scraper integration with real endpoints
"""
import asyncio
import httpx
import json
from datetime import datetime

async def test_api_integration():
    """Test the complete API integration"""
    print("🚀 Starting API Integration Test")
    print(f"⏰ Started at: {datetime.now()}")
    
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            # Test 1: Health check
            print("\n📋 Test 1: Health Check")
            response = await client.get(f"{base_url}/health")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                health_data = response.json()
                print(f"   Server Status: {health_data['status']}")
                print(f"   Timestamp: {health_data['timestamp']}")
                print("   ✅ Health check passed")
            else:
                print("   ❌ Health check failed")
                return False
            
            # Test 2: Extract URL metadata
            print("\n📋 Test 2: URL Metadata Extraction")
            extract_data = {
                "url": "https://httpbin.org/forms/post",
                "wait_for_js": False,
                "timeout": 30
            }
            
            response = await client.post(f"{base_url}/extract/url", json=extract_data)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 201:
                metadata = response.json()
                print(f"   Metadata ID: {metadata['id']}")
                print(f"   URL: {metadata['page_url']}")
                print(f"   Source Type: {metadata['source_type']}")
                print(f"   Fields Extracted: {len(metadata['fields'])}")
                
                for i, field in enumerate(metadata['fields'][:3], 1):  # Show first 3 fields
                    print(f"     {i}. {field['field_id']} ({field['type']}) - {field['label']}")
                
                print("   ✅ URL extraction passed")
                metadata_id = metadata['id']
            else:
                print(f"   ❌ URL extraction failed: {response.text}")
                return False
            
            # Test 3: Get metadata by ID
            print("\n📋 Test 3: Get Metadata by ID")
            response = await client.get(f"{base_url}/metadata/{metadata_id}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                retrieved_metadata = response.json()
                print(f"   Retrieved ID: {retrieved_metadata['id']}")
                print(f"   Fields Count: {len(retrieved_metadata['fields'])}")
                print("   ✅ Metadata retrieval passed")
            else:
                print(f"   ❌ Metadata retrieval failed: {response.text}")
                return False
            
            # Test 4: List all metadata
            print("\n📋 Test 4: List All Metadata")
            response = await client.get(f"{base_url}/metadata/")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                all_metadata = response.json()
                print(f"   Total Records: {len(all_metadata)}")
                print("   ✅ Metadata listing passed")
            else:
                print(f"   ❌ Metadata listing failed: {response.text}")
                return False
            
            # Test 5: Start test run
            print("\n📋 Test 5: Start Test Run")
            test_data = {
                "use_ai_data": False,  # Use regex generation for now
                "test_scenarios": ["valid_data", "invalid_data"]
            }
            
            response = await client.post(f"{base_url}/test/{metadata_id}", json=test_data)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 201:
                test_run = response.json()
                print(f"   Test Run ID: {test_run['id']}")
                print(f"   Status: {test_run['status']}")
                print(f"   Scenarios: {len(test_run.get('generated_data', []))}")
                print("   ✅ Test run creation passed")
                test_run_id = test_run['id']
            else:
                print(f"   ❌ Test run creation failed: {response.text}")
                return False
            
            # Test 6: Get test results
            print("\n📋 Test 6: Get Test Results")
            response = await client.get(f"{base_url}/results/{test_run_id}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                results = response.json()
                print(f"   Test Run Status: {results['status']}")
                print(f"   Results Available: {'test_results' in results}")
                print("   ✅ Results retrieval passed")
            else:
                print(f"   ❌ Results retrieval failed: {response.text}")
                return False
            
            print("\n🎉 All integration tests passed!")
            print("🔧 API is fully functional and ready for use")
            return True
            
        except Exception as e:
            print(f"\n💥 Integration test failed with error: {str(e)}")
            return False

async def main():
    """Main function"""
    print("=" * 60)
    print("🧪 METADATA-DRIVEN UI TESTING FRAMEWORK")
    print("🔌 API Integration Test")
    print("=" * 60)
    
    # Check if server is running
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/health", timeout=5.0)
            if response.status_code != 200:
                print("❌ Server is not responding properly")
                print("💡 Make sure to start the server with: ./start.sh")
                return
    except Exception:
        print("❌ Server is not running or not accessible")
        print("💡 Make sure to start the server with: ./start.sh")
        return
    
    success = await test_api_integration()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ INTEGRATION TEST: PASSED")
        print("🚀 Deliverable 3 (Web Scraper Implementation) COMPLETED")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ INTEGRATION TEST: FAILED") 
        print("🔧 Please check the server logs for details")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
