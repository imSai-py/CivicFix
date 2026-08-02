import io
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.issues.issue_entity import Category, Department
from src.infrastructure.persistence.repositories.issue_repository_impl import IssueRepositoryImpl


@pytest.fixture
async def seeded_category(db_session: AsyncSession) -> Category:
    repo = IssueRepositoryImpl(db_session)
    dept = Department(name="Roads & Highways", code="DEPT-ROADS", description="Road repairs")
    saved_dept = await repo.save_department(dept)

    cat = Category(
        name="Pothole Damage",
        description="Road surface potholes",
        default_department_id=saved_dept.id,
        default_sla_hours=48
    )
    saved_cat = await repo.save_category(cat)
    await db_session.commit()
    return saved_cat


@pytest.fixture
async def citizen_auth_headers(client: AsyncClient) -> dict:
    reg_payload = {
        "email": "issue.reporter@example.com",
        "password": "Password123!",
        "full_name": "Issue Reporter"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "issue.reporter@example.com",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_list_categories_endpoint(client: AsyncClient, seeded_category: Category):
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 1
    assert categories[0]["name"] == "Pothole Damage"


@pytest.mark.asyncio
async def test_create_and_list_issues(
    client: AsyncClient,
    citizen_auth_headers: dict,
    seeded_category: Category
):
    issue_payload = {
        "title": "Large Pothole on 5th Avenue",
        "description": "Deep hole in the middle lane causing dangerous driving conditions.",
        "category_id": str(seeded_category.id),
        "location": {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "address": "5th Avenue & Market St"
        },
        "priority": "HIGH"
    }

    # 1. Create Issue
    create_resp = await client.post("/api/v1/issues", json=issue_payload, headers=citizen_auth_headers)
    assert create_resp.status_code == 201
    issue_data = create_resp.json()
    assert issue_data["title"] == "Large Pothole on 5th Avenue"
    assert issue_data["status"] == "SUBMITTED"
    assert issue_data["priority"] == "HIGH"
    issue_id = issue_data["id"]

    # 2. List Issues Feed
    list_resp = await client.get("/api/v1/issues")
    assert list_resp.status_code == 200
    feed = list_resp.json()
    assert feed["total_items"] >= 1
    assert feed["items"][0]["id"] == issue_id


@pytest.mark.asyncio
async def test_upvote_issue(
    client: AsyncClient,
    citizen_auth_headers: dict,
    seeded_category: Category
):
    issue_payload = {
        "title": "Broken Streetlight",
        "description": "Dark street corner needs lamp replacement.",
        "category_id": str(seeded_category.id),
        "location": {"latitude": 40.7128, "longitude": -74.0060}
    }
    create_resp = await client.post("/api/v1/issues", json=issue_payload, headers=citizen_auth_headers)
    issue_id = create_resp.json()["id"]

    # Upvote Issue
    upvote_resp = await client.post(f"/api/v1/issues/{issue_id}/upvote", headers=citizen_auth_headers)
    assert upvote_resp.status_code == 200
    assert upvote_resp.json()["upvote_count"] == 1

    # Duplicate Upvote -> 409 Conflict
    dup_upvote_resp = await client.post(f"/api/v1/issues/{issue_id}/upvote", headers=citizen_auth_headers)
    assert dup_upvote_resp.status_code == 409


@pytest.mark.asyncio
async def test_upload_image_attachment(
    client: AsyncClient,
    citizen_auth_headers: dict,
    seeded_category: Category
):
    issue_payload = {
        "title": "Water Leakage",
        "description": "Pipe leaking water on sidewalk.",
        "category_id": str(seeded_category.id),
        "location": {"latitude": 34.0522, "longitude": -118.2437}
    }
    create_resp = await client.post("/api/v1/issues", json=issue_payload, headers=citizen_auth_headers)
    issue_id = create_resp.json()["id"]

    # Upload JPEG photo file
    fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 100
    files = {"file": ("pothole.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}

    upload_resp = await client.post(
        f"/api/v1/issues/{issue_id}/attachments",
        files=files,
        headers=citizen_auth_headers
    )
    assert upload_resp.status_code == 201
    attachment = upload_resp.json()
    assert attachment["issue_id"] == issue_id
    assert attachment["mime_type"] == "image/jpeg"
    assert "/uploads/" in attachment["file_path"]
