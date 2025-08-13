from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import datetime
from typing import List, Optional, Dict, Any


class SourceType(str, enum.Enum):
    WEB_PAGE = "web_page"
    GITHUB_REPOSITORY = "github_repository"


class TestStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class FieldType(str, enum.Enum):
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


class FieldMetadata(Base):
    """
    Core metadata table storing extracted form field information
    Follows the exact JSON contract specified in requirements
    """
    __tablename__ = "field_metadata"

    id = Column(Integer, primary_key=True, index=True)
    page_url = Column(String(2048), nullable=False, index=True)
    extracted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    source_type = Column(Enum(SourceType), nullable=False)
    fields_data = Column(JSON, nullable=False)  # Store the complete fields array as JSON
    
    # Additional fields for web scraper
    page_title = Column(String(512), nullable=True)  # Page title for web pages
    repository_branch = Column(String(256), nullable=True)  # Branch for GitHub repos
    scanned_files = Column(JSON, nullable=True)  # List of scanned files for GitHub repos
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    test_runs = relationship("TestRun", back_populates="field_metadata", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<FieldMetadata(id={self.id}, url={self.page_url}, source={self.source_type})>"


class TestRun(Base):
    """
    Test execution records with generated data and results
    """
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    metadata_id = Column(Integer, ForeignKey("field_metadata.id"), nullable=False)
    status = Column(Enum(TestStatus), default=TestStatus.PENDING, nullable=False)
    generated_data = Column(JSON, nullable=True)  # AI/regex generated test data
    test_results = Column(JSON, nullable=True)  # Pass/fail results per field
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    field_metadata = relationship("FieldMetadata", back_populates="test_runs")
    screenshots = relationship("Screenshot", back_populates="test_run", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TestRun(id={self.id}, metadata_id={self.metadata_id}, status={self.status})>"


class Screenshot(Base):
    """
    Screenshot storage for test runs
    """
    __tablename__ = "screenshots"

    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id"), nullable=False)
    screenshot_type = Column(String(50), nullable=False)  # 'before', 'after', 'error'
    file_path = Column(String(1024), nullable=False)
    file_size = Column(Integer, nullable=True)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    test_run = relationship("TestRun", back_populates="screenshots")

    def __repr__(self):
        return f"<Screenshot(id={self.id}, test_run_id={self.test_run_id}, type={self.screenshot_type})>"


class GitHubRepository(Base):
    """
    GitHub repository tracking for source management
    """
    __tablename__ = "github_repositories"

    id = Column(Integer, primary_key=True, index=True)
    repository_url = Column(String(1024), nullable=False, unique=True, index=True)
    owner = Column(String(255), nullable=False)
    repo_name = Column(String(255), nullable=False)
    branch = Column(String(255), default="main", nullable=False)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    scan_status = Column(String(50), default="pending")  # pending, scanning, completed, failed
    files_scanned = Column(Integer, default=0)
    forms_found = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<GitHubRepository(id={self.id}, repo={self.owner}/{self.repo_name})>"
