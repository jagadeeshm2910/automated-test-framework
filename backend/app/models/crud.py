from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, and_
from app.models import FieldMetadata, TestRun, Screenshot, GitHubRepository
from app.models.schemas import MetadataCreate, TestRunRequest, SourceType, TestStatus, MetadataResponse, FormField
from typing import List, Optional, Dict, Any
from datetime import datetime


class MetadataCRUD:
    """CRUD operations for FieldMetadata model"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    @staticmethod
    async def create(db: AsyncSession, metadata_data: MetadataCreate) -> FieldMetadata:
        """Create new metadata record"""
        db_metadata = FieldMetadata(
            page_url=metadata_data.page_url,
            source_type=metadata_data.source_type,
            fields_data=[field.model_dump() for field in metadata_data.fields],
            page_title=getattr(metadata_data, 'page_title', None),
            repository_branch=getattr(metadata_data, 'repository_branch', None),
            scanned_files=getattr(metadata_data, 'scanned_files', None),
            extracted_at=datetime.utcnow()
        )
        db.add(db_metadata)
        await db.flush()
        await db.refresh(db_metadata)
        return db_metadata
    
    @staticmethod
    async def get_by_id(db: AsyncSession, metadata_id: int) -> Optional[FieldMetadata]:
        """Get metadata by ID"""
        result = await db.execute(
            select(FieldMetadata).where(FieldMetadata.id == metadata_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_all(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        source_type: Optional[SourceType] = None
    ) -> List[FieldMetadata]:
        """Get all metadata with pagination and filtering"""
        query = select(FieldMetadata).order_by(desc(FieldMetadata.created_at))
        
        if source_type:
            query = query.where(FieldMetadata.source_type == source_type)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_by_url(db: AsyncSession, page_url: str) -> Optional[FieldMetadata]:
        """Get metadata by URL (most recent if multiple)"""
        result = await db.execute(
            select(FieldMetadata)
            .where(FieldMetadata.page_url == page_url)
            .order_by(desc(FieldMetadata.created_at))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete(db: AsyncSession, metadata_id: int) -> bool:
        """Delete metadata by ID"""
        metadata = await MetadataCRUD.get_by_id(db, metadata_id)
        if metadata:
            await db.delete(metadata)
            return True
        return False
    
    async def create_metadata(self, metadata_data: MetadataCreate) -> MetadataResponse:
        """Create new metadata record and return response schema"""
        from .schemas import MetadataResponse, FormField
        
        db_metadata = await self.create(self.db, metadata_data)
        
        # Convert to response schema
        return MetadataResponse(
            id=db_metadata.id,
            page_url=db_metadata.page_url,
            source_type=db_metadata.source_type,
            fields=[FormField(**field_data) for field_data in db_metadata.fields_data],
            page_title=db_metadata.page_title,
            repository_branch=db_metadata.repository_branch,
            scanned_files=db_metadata.scanned_files,
            extracted_at=db_metadata.extracted_at,
            created_at=db_metadata.created_at,
            updated_at=db_metadata.updated_at
        )


class TestRunCRUD:
    """CRUD operations for TestRun model"""
    
    @staticmethod
    async def create(db: AsyncSession, metadata_id: int, test_request: TestRunRequest, generated_data=None) -> TestRun:
        """Create new test run with optional generated data"""
        db_test_run = TestRun(
            metadata_id=metadata_id,
            status=TestStatus.PENDING,
            generated_data=generated_data,
            started_at=datetime.utcnow()
        )
        db.add(db_test_run)
        await db.flush()
        await db.refresh(db_test_run)
        return db_test_run
    
    @staticmethod
    async def get_by_id(db: AsyncSession, test_run_id: int) -> Optional[TestRun]:
        """Get test run by ID with relationships"""
        result = await db.execute(
            select(TestRun)
            .options(selectinload(TestRun.field_metadata), selectinload(TestRun.screenshots))
            .where(TestRun.id == test_run_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_metadata_id(db: AsyncSession, metadata_id: int) -> List[TestRun]:
        """Get all test runs for a metadata record"""
        result = await db.execute(
            select(TestRun)
            .options(selectinload(TestRun.screenshots))
            .where(TestRun.metadata_id == metadata_id)
            .order_by(desc(TestRun.created_at))
        )
        return result.scalars().all()
    
    @staticmethod
    async def update_status(
        db: AsyncSession, 
        test_run_id: int, 
        status: TestStatus,
        generated_data: Optional[Dict[str, Any]] = None,
        test_results: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> Optional[TestRun]:
        """Update test run status and results"""
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if test_run:
            test_run.status = status
            if generated_data:
                test_run.generated_data = generated_data
            if test_results:
                test_run.test_results = test_results
            if error_message:
                test_run.error_message = error_message
            if status == TestStatus.COMPLETED or status == TestStatus.FAILED:
                test_run.completed_at = datetime.utcnow()
            
            await db.flush()
            await db.refresh(test_run)
        return test_run

    @staticmethod
    async def update_results(
        db: AsyncSession,
        test_run_id: int,
        status: TestStatus,
        test_results: Dict[str, Any]
    ) -> Optional[TestRun]:
        """Update test run with results"""
        test_run = await TestRunCRUD.get_by_id(db, test_run_id)
        if test_run:
            test_run.status = status
            test_run.test_results = test_results
            if status == TestStatus.COMPLETED or status == TestStatus.FAILED:
                test_run.completed_at = datetime.utcnow()
            
            await db.flush()
            await db.refresh(test_run)
        return test_run

    @staticmethod
    async def delete(db: AsyncSession, test_run_id: int) -> bool:
        """Delete a test run"""
        test_run = await db.get(TestRun, test_run_id)
        if test_run:
            await db.delete(test_run)
            await db.flush()
            return True
        return False


class GitHubRepositoryCRUD:
    """CRUD operations for GitHubRepository model"""
    
    @staticmethod
    async def create(
        db: AsyncSession, 
        repository_url: str, 
        owner: str, 
        repo_name: str, 
        branch: str = "main"
    ) -> GitHubRepository:
        """Create new GitHub repository record"""
        db_repo = GitHubRepository(
            repository_url=repository_url,
            owner=owner,
            repo_name=repo_name,
            branch=branch,
            scan_status="pending"
        )
        db.add(db_repo)
        await db.flush()
        await db.refresh(db_repo)
        return db_repo
    
    @staticmethod
    async def get_by_url(db: AsyncSession, repository_url: str) -> Optional[GitHubRepository]:
        """Get repository by URL"""
        result = await db.execute(
            select(GitHubRepository).where(GitHubRepository.repository_url == repository_url)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_scan_status(
        db: AsyncSession, 
        repo_id: int, 
        status: str,
        files_scanned: Optional[int] = None,
        forms_found: Optional[int] = None
    ) -> Optional[GitHubRepository]:
        """Update repository scan status"""
        repo = await db.get(GitHubRepository, repo_id)
        if repo:
            repo.scan_status = status
            repo.last_scanned_at = datetime.utcnow()
            if files_scanned is not None:
                repo.files_scanned = files_scanned
            if forms_found is not None:
                repo.forms_found = forms_found
            
            await db.flush()
            await db.refresh(repo)
        return repo


class ScreenshotCRUD:
    """CRUD operations for Screenshot model"""

    @staticmethod
    async def create_screenshot(
        db: AsyncSession,
        test_run_id: int,
        screenshot_type: str,
        file_path: str,
        file_size: int = None
    ) -> Screenshot:
        """Create new screenshot record"""
        db_screenshot = Screenshot(
            test_run_id=test_run_id,
            screenshot_type=screenshot_type,
            file_path=file_path,
            file_size=file_size,
            taken_at=datetime.utcnow()
        )
        db.add(db_screenshot)
        await db.flush()
        await db.refresh(db_screenshot)
        return db_screenshot

    @staticmethod
    async def create(db: AsyncSession, screenshot_data: Dict[str, Any]) -> Screenshot:
        """Create new screenshot record from dict"""
        db_screenshot = Screenshot(
            test_run_id=screenshot_data["test_run_id"],
            screenshot_type=screenshot_data["screenshot_type"],
            file_path=screenshot_data["file_path"],
            file_size=screenshot_data.get("file_size", 0),
            taken_at=datetime.utcnow()
        )
        db.add(db_screenshot)
        await db.flush()
        await db.refresh(db_screenshot)
        return db_screenshot

    @staticmethod
    async def get_by_test_run_id(db: AsyncSession, test_run_id: int) -> List[Screenshot]:
        """Get all screenshots for a test run"""
        result = await db.execute(
            select(Screenshot)
            .where(Screenshot.test_run_id == test_run_id)
            .order_by(Screenshot.taken_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_by_id(db: AsyncSession, screenshot_id: int) -> Optional[Screenshot]:
        """Get screenshot by ID"""
        result = await db.execute(
            select(Screenshot).where(Screenshot.id == screenshot_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_screenshot(db: AsyncSession, screenshot_id: int) -> bool:
        """Delete screenshot record"""
        screenshot = await ScreenshotCRUD.get_by_id(db, screenshot_id)
        if screenshot:
            await db.delete(screenshot)
            return True
        return False
