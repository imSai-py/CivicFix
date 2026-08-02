import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.issues.issue_entity import Category, Department
from src.domain.users.user_entity import User, UserRole
from src.domain.common.value_objects import EmailAddress
from src.infrastructure.persistence.repositories.issue_repository_impl import IssueRepositoryImpl
from src.infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl
from src.infrastructure.security.password_hasher import BcryptPasswordHasher
from src.infrastructure.security.jwt_handler import PyJWTHandler


@pytest.fixture
async def admin_auth_headers(db_session: AsyncSession) -> dict:
    user_repo = UserRepositoryImpl(db_session)
    hasher = BcryptPasswordHasher()
    jwt_handler = PyJWTHandler()

    admin = User(
        email=EmailAddress("admin.boss@civicfix.gov"),
        password_hash=hasher.hash_password("AdminSecret123!"),
        full_name="System Admin",
        role=UserRole.ADMIN
    )
    saved_admin = await user_repo.save(admin)
    await db_session.commit()

    token = jwt_handler.create_access_token(
        subject=str(saved_admin.id),
        claims={"role": UserRole.ADMIN.value, "email": saved_admin.email.value}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def official_auth_headers(db_session: AsyncSession) -> dict:
    user_repo = UserRepositoryImpl(db_session)
    hasher = BcryptPasswordHasher()
    jwt_handler = PyJWTHandler()

    official = User(
        email=EmailAddress("official.worker@civicfix.gov"),
        password_hash=hasher.hash_password("OfficialSecret123!"),
        full_name="Department Worker",
        role=UserRole.OFFICIAL
    )
    saved_official = await user_repo.save(official)
    await db_session.commit()

    token = jwt_handler.create_access_token(
        subject=str(saved_official.id),
        claims={"role": UserRole.OFFICIAL.value, "email": saved_official.email.value}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def citizen_auth_headers_admin_test(client: AsyncClient) -> dict:
    reg_payload = {
        "email": "citizen.voter@example.com",
        "password": "Password123!",
        "full_name": "Citizen Voter"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "citizen.voter@example.com",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_test_deps(db_session: AsyncSession):
    repo = IssueRepositoryImpl(db_session)
    dept1 = Department(name="Primary Roads", code="DEPT-ROADS1")
    dept2 = Department(name="Emergency Sanitation", code="DEPT-SANI2")
    s_dept1 = await repo.save_department(dept1)
    s_dept2 = await repo.save_department(dept2)

    cat = Category(
        name="Bridge Structural Defect",
        default_department_id=s_dept1.id
    )
    s_cat = await repo.save_category(cat)
    await db_session.commit()
    return s_cat, s_dept1, s_dept2


@pytest.mark.asyncio
async def test_admin_approval_rejection_assignment_flow(
    client: AsyncClient,
    citizen_auth_headers_admin_test: dict,
    official_auth_headers: dict,
    admin_auth_headers: dict,
    admin_test_deps
):
    cat, dept1, dept2 = admin_test_deps

    # 1. Citizen creates issue report
    issue_payload = {
        "title": "Crack on Main Bridge",
        "description": "Noticeable 1-inch wide crack appearing on support pillar.",
        "category_id": str(cat.id),
        "location": {"latitude": 40.7128, "longitude": -74.0060}
    }
    create_resp = await client.post("/api/v1/issues", json=issue_payload, headers=citizen_auth_headers_admin_test)
    assert create_resp.status_code == 201
    issue_id = create_resp.json()["id"]

    # 2. Official Approves report (SUBMITTED -> ACKNOWLEDGED)
    approve_resp = await client.post(
        f"/api/v1/issues/{issue_id}/approve",
        json={"remarks": "Report verified by field inspection."},
        headers=official_auth_headers
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "ACKNOWLEDGED"

    # 3. Admin Reassigns Department (to Emergency Sanitation)
    assign_resp = await client.post(
        f"/api/v1/issues/{issue_id}/assign",
        json={"department_id": str(dept2.id), "remarks": "Reassigned due to department workload."},
        headers=admin_auth_headers
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["assigned_department_id"] == str(dept2.id)

    # 4. Fetch Audit Logs
    audit_resp = await client.get(f"/api/v1/issues/{issue_id}/audit-logs", headers=citizen_auth_headers_admin_test)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) == 3
    assert logs[0]["action"] == "REPORT_SUBMITTED"
    assert logs[1]["action"] == "REPORT_APPROVED"
    assert logs[2]["action"] == "DEPARTMENT_ASSIGNED"


@pytest.mark.asyncio
async def test_citizen_blocked_from_admin_endpoints(
    client: AsyncClient,
    citizen_auth_headers_admin_test: dict,
    admin_test_deps
):
    cat, dept1, dept2 = admin_test_deps

    issue_payload = {
        "title": "Illegal Trash Dumping",
        "description": "Piles of trash left on park lawn.",
        "category_id": str(cat.id),
        "location": {"latitude": 34.0522, "longitude": -118.2437}
    }
    create_resp = await client.post("/api/v1/issues", json=issue_payload, headers=citizen_auth_headers_admin_test)
    issue_id = create_resp.json()["id"]

    # Citizen tries to call /approve -> 403 Forbidden
    approve_resp = await client.post(f"/api/v1/issues/{issue_id}/approve", headers=citizen_auth_headers_admin_test)
    assert approve_resp.status_code == 403

    # Citizen tries to call /assign -> 403 Forbidden
    assign_resp = await client.post(
        f"/api/v1/issues/{issue_id}/assign",
        json={"department_id": str(dept2.id)},
        headers=citizen_auth_headers_admin_test
    )
    assert assign_resp.status_code == 403
