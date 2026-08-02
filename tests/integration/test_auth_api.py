import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data


@pytest.mark.asyncio
async def test_user_registration_success(client: AsyncClient):
    payload = {
        "email": "citizen.john@example.com",
        "password": "SecurePassword123!",
        "full_name": "John Doe",
        "phone_number": "+12025550199"
    }

    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "citizen.john@example.com"
    assert data["role"] == "CITIZEN"
    assert data["full_name"] == "John Doe"
    assert "id" in data


@pytest.mark.asyncio
async def test_duplicate_registration_fails(client: AsyncClient):
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "full_name": "Duplicate User"
    }

    resp1 = await client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = await client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409
    assert resp2.json()["error"]["code"] == "RESOURCE_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_login_and_access_protected_me_endpoint(client: AsyncClient):
    # 1. Register
    reg_payload = {
        "email": "auth.user@example.com",
        "password": "MySecretPassword123!",
        "full_name": "Authenticated User"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Login
    login_payload = {
        "email": "auth.user@example.com",
        "password": "MySecretPassword123!"
    }
    login_resp = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data

    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]

    # 3. Access /users/me with Bearer token
    headers = {"Authorization": f"Bearer {access_token}"}
    me_resp = await client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "auth.user@example.com"

    # 4. Refresh token flow
    refresh_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert "access_token" in new_tokens


@pytest.mark.asyncio
async def test_rbac_protection_blocks_citizen(client: AsyncClient):
    # 1. Register & Login as Citizen
    reg_payload = {
        "email": "regular.citizen@example.com",
        "password": "CitizenPassword123!",
        "full_name": "Plain Citizen"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "regular.citizen@example.com",
        "password": "CitizenPassword123!"
    })
    access_token = login_resp.json()["access_token"]

    # 2. Try accessing official-only endpoint -> 403 Forbidden
    headers = {"Authorization": f"Bearer {access_token}"}
    rbac_resp = await client.get("/api/v1/users/official-only-demo", headers=headers)
    assert rbac_resp.status_code == 403
    assert rbac_resp.json()["error"]["code"] == "ACCESS_DENIED"
