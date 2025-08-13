from pydantic import BaseModel, HttpUrl, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    WEB_PAGE = "web_page"
    GITHUB_REPOSITORY = "github_repository"


class TestStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class FieldType(str, Enum):
    TEXT = "text"
    PASSWORD = "password"
    EMAIL = "email"
    NUMBER = "number"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    SELECT = "select"
    TEXTAREA = "textarea"
    DATE = "date"
    TIME = "time"
    DATETIME = "datetime"
    URL = "url"
    PHONE = "phone"
    FILE = "file"
    HIDDEN = "hidden"


# Validation schemas (for form field metadata)
class FieldValidation(BaseModel):
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    regex: Optional[str] = None
    min_value: Optional[Union[int, float]] = None
    max_value: Optional[Union[int, float]] = None


class FieldOption(BaseModel):
    value: str
    label: str


class FormField(BaseModel):
    """
    Individual form field schema matching the JSON contract exactly
    """
    field_id: str = Field(..., description="Logical field identifier (HTML name/id)")
    label: str = Field(..., description="Human-readable name")
    type: FieldType = Field(..., description="Semantic type")
    input_type: str = Field(..., description="HTML type attribute or equivalent")
    xpath: str = Field(..., description="XPath selector for automation")
    css_selector: str = Field(..., description="CSS selector for automation")
    required: bool = Field(default=False, description="Whether the field is mandatory")
    placeholder: str = Field(default="", description="HTML placeholder if present")
    default_value: str = Field(default="", description="Any default pre-filled value")
    options: List[str] = Field(default_factory=list, description="Options for select/radio")
    validation: Optional[FieldValidation] = Field(default=None, description="Validation rules")
    is_visible: Optional[bool] = Field(default=True, description="Whether field is visible")
    source_file: Optional[str] = Field(default=None, description="Source file path for GitHub repos")


class MetadataBase(BaseModel):
    """
    Base schema for metadata following the exact JSON contract
    """
    page_url: str = Field(..., description="URL where fields were extracted")
    source_type: SourceType = Field(..., description="Source type: web_page or github_repository")
    fields: List[FormField] = Field(..., description="List of detected form fields")
    page_title: Optional[str] = Field(default=None, description="Page title for web pages")
    repository_branch: Optional[str] = Field(default=None, description="Branch for GitHub repos")
    scanned_files: Optional[List[str]] = Field(default=None, description="Scanned files for GitHub repos")


class MetadataCreate(MetadataBase):
    """Schema for creating new metadata"""
    pass


class MetadataResponse(MetadataBase):
    """Schema for metadata responses"""
    id: int
    extracted_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Request schemas
class URLExtractionRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL to extract form metadata from")
    wait_for_js: bool = Field(default=True, description="Wait for JavaScript to load")
    timeout: int = Field(default=30, description="Timeout in seconds", ge=5, le=120)

    @validator('url')
    def validate_url(cls, v):
        url_str = str(v)
        if not (url_str.startswith('http://') or url_str.startswith('https://')):
            raise ValueError('URL must start with http:// or https://')
        return url_str


class GitHubExtractionRequest(BaseModel):
    repository_url: HttpUrl = Field(..., description="GitHub repository URL")
    branch: str = Field(default="main", description="Branch to scan")
    file_patterns: List[str] = Field(
        default=["**/*.html", "**/*.jsx", "**/*.tsx", "**/*.vue"],
        description="File patterns to scan for forms"
    )

    @validator('repository_url')
    def validate_github_url(cls, v):
        url_str = str(v)
        if 'github.com' not in url_str:
            raise ValueError('Must be a GitHub repository URL')
        return url_str


class TestRunRequest(BaseModel):
    use_ai_data: bool = Field(default=True, description="Use AI for data generation (fallback to regex)")
    test_scenarios: List[str] = Field(
        default=["valid_data", "invalid_data", "boundary_values"],
        description="Test scenarios to run"
    )


# Response schemas
class TestRunResponse(BaseModel):
    id: int
    metadata_id: int
    status: TestStatus
    generated_data: Optional[Dict[str, Any]] = None
    test_results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ScreenshotResponse(BaseModel):
    id: int
    test_run_id: int
    screenshot_type: str
    file_path: str
    file_size: Optional[int] = None
    taken_at: datetime

    class Config:
        from_attributes = True


class GitHubRepositoryResponse(BaseModel):
    id: int
    repository_url: str
    owner: str
    repo_name: str
    branch: str
    last_scanned_at: Optional[datetime] = None
    scan_status: str
    files_scanned: int
    forms_found: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Generic response schemas
class HealthResponse(BaseModel):
    status: str = "healthy"
    timestamp: datetime
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime
