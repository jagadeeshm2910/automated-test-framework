# Test GitHub scanner functionality
import asyncio
import logging
from app.services.github_scanner import GitHubScannerService

# Configure logging
logging.basicConfig(level=logging.INFO)

async def test_github_scanner():
    """Test the GitHub scanner with a simple repository"""
    
    # Test with a simple public repo - using a smaller one for testing
    test_repo = "https://github.com/twbs/bootstrap"
    
    print(f"🧪 Testing GitHub scanner with repository: {test_repo}")
    
    try:
        async with GitHubScannerService() as scanner:
            metadata = await scanner.extract_metadata_from_repository(
                repository_url=test_repo,
                branch="main",
                file_patterns=["**/*.html"]  # Only HTML files for testing
            )
        
        print(f"✅ Successfully extracted metadata!")
        print(f"📄 Repository URL: {metadata.page_url}")
        print(f"🌿 Branch: {metadata.repository_branch}")
        print(f"📊 Source Type: {metadata.source_type}")
        print(f"🔢 Number of fields: {len(metadata.fields)}")
        print(f"📁 Scanned files: {len(metadata.scanned_files) if metadata.scanned_files else 0}")
        
        if metadata.scanned_files:
            print(f"\n📂 Sample scanned files:")
            for file_path in metadata.scanned_files[:5]:  # Show first 5
                print(f"  - {file_path}")
            if len(metadata.scanned_files) > 5:
                print(f"  ... and {len(metadata.scanned_files) - 5} more files")
        
        if metadata.fields:
            print(f"\n📝 Extracted Fields:")
            for i, field in enumerate(metadata.fields[:10]):  # Show first 10
                print(f"  {i+1}. {field.field_id} ({field.type.value})")
                print(f"     Label: {field.label}")
                print(f"     Source: {field.source_file}")
                print()
        
    except Exception as e:
        print(f"❌ Error testing GitHub scanner: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_github_scanner())
