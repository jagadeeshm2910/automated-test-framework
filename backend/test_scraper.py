# Test scraper functionality with a simple web page
import asyncio
import logging
from app.services.web_scraper import WebScraperService

# Configure logging
logging.basicConfig(level=logging.INFO)

async def test_web_scraper():
    """Test the web scraper with a simple example"""
    
    # Test URL - using httpbin.org which has a simple form
    test_url = "https://httpbin.org/forms/post"
    
    print(f"🧪 Testing web scraper with URL: {test_url}")
    
    try:
        async with WebScraperService() as scraper:
            metadata = await scraper.extract_metadata_from_url(
                url=test_url,
                wait_for_js=False,  # httpbin.org doesn't need JS
                timeout=10
            )
        
        print(f"✅ Successfully extracted metadata!")
        print(f"📄 Page URL: {metadata.page_url}")
        print(f"🏷️  Page Title: {metadata.page_title}")
        print(f"📊 Source Type: {metadata.source_type}")
        print(f"🔢 Number of fields: {len(metadata.fields)}")
        
        print(f"\n📝 Extracted Fields:")
        for i, field in enumerate(metadata.fields):
            print(f"  {i+1}. {field.field_id} ({field.type.value})")
            print(f"     Label: {field.label}")
            print(f"     Required: {field.required}")
            print(f"     CSS Selector: {field.css_selector}")
            print(f"     XPath: {field.xpath}")
            if field.validation:
                print(f"     Validation: {field.validation}")
            print()
        
    except Exception as e:
        print(f"❌ Error testing web scraper: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_web_scraper())
