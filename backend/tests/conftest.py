import pytest
import pytest_asyncio
import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import get_db, Base
from app.models.schemas import MetadataCreate, FormField, FieldType, FieldValidation, SourceType


# Test database setup
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """Setup test database"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def clean_database():
    """Clean database before each test"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


@pytest_asyncio.fixture
async def client(setup_database, clean_database):
    """Create test client"""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_metadata_create():
    """Sample metadata for testing"""
    return MetadataCreate(
        page_url="https://example.com/test-form",
        source_type=SourceType.WEB_PAGE,
        fields=[
            FormField(
                field_id="email",
                label="Email Address",
                type=FieldType.EMAIL,
                input_type="email",
                xpath="//input[@name='email']",
                css_selector="input[name='email']",
                required=True,
                placeholder="Enter your email",
                default_value="",
                options=[],
                validation=FieldValidation(regex=r"^[^@]+@[^@]+\.[^@]+$")
            ),
            FormField(
                field_id="password",
                label="Password",
                type=FieldType.PASSWORD,
                input_type="password",
                xpath="//input[@name='password']",
                css_selector="input[name='password']",
                required=True,
                placeholder="Enter password",
                default_value="",
                options=[],
                validation=FieldValidation(min_length=8)
            )
        ]
    )
