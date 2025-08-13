from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import structlog
from datetime import datetime

# Import routers
from app.api import extraction, metadata, testing, results, data_generation
from app.database import async_engine, Base
from app.models.schemas import HealthResponse, ErrorResponse


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("Starting UI Testing Framework API")
    
    # Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created/verified")
    
    yield
    
    logger.info("Shutting down UI Testing Framework API")


# Create FastAPI application
app = FastAPI(
    title="UI Testing Framework API",
    description="""
    A comprehensive metadata-driven UI testing framework that extracts form field metadata 
    from web pages and GitHub repositories, generates realistic test data using AI, 
    and runs automated UI tests with screenshot capture.
    
    ## Features
    
    * **Web Scraping**: Extract form metadata from live web pages using Playwright + Scrapy + lxml
    * **GitHub Scanning**: Scan repositories for form definitions in React/Vue/HTML files
    * **AI Data Generation**: Generate realistic test data using LLaMA model with regex fallback
    * **Automated Testing**: Run Playwright-based UI tests with screenshot capture
    * **Results Management**: Comprehensive test result storage and retrieval
    
    ## Workflow
    
    1. Extract metadata from URLs or GitHub repos (`/extract/url` or `/extract/github`)
    2. View extracted metadata (`/metadata/{id}`)
    3. Run tests on metadata (`/test/{metadata_id}`)
    4. View results and screenshots (`/results/{test_run_id}`)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5176", "http://127.0.0.1:5176"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            detail="Internal server error",
            error_code="INTERNAL_ERROR",
            timestamp=datetime.utcnow()
        ).dict()
    )


# Health check endpoint
@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint for monitoring service status"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )


# Include API routers
app.include_router(extraction.router)
app.include_router(metadata.router)
app.include_router(testing.router)
app.include_router(results.router)
app.include_router(data_generation.router)


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "UI Testing Framework API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "extraction": "/extract",
            "metadata": "/metadata",
            "testing": "/test",
            "results": "/results",
            "data_generation": "/generate"
        }
    }
