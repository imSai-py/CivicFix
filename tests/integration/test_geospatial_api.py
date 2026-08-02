import pytest
from httpx import AsyncClient
from src.domain.issues.issue_entity import Category, Department
from src.infrastructure.persistence.repositories.issue_repository_impl import IssueRepositoryImpl


@pytest.fixture
async def geo_category(db_session) -> Category:
    repo = IssueRepositoryImpl(db_session)
    dept = Department(name="GIS Ops", code="DEPT-GIS")
    saved_dept = await repo.save_department(dept)

    cat = Category(
        name="Geospatial Hazard",
        default_department_id=saved_dept.id
    )
    saved_cat = await repo.save_category(cat)
    await db_session.commit()
    return saved_cat


@pytest.fixture
async def geo_auth_headers(client: AsyncClient) -> dict:
    reg_payload = {
        "email": "geo.user@example.com",
        "password": "Password123!",
        "full_name": "Geo User"
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "geo.user@example.com",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_nearby_issues_geojson(
    client: AsyncClient,
    geo_auth_headers: dict,
    geo_category: Category
):
    # 1. Create issue in San Francisco (37.7749, -122.4194)
    sf_issue = {
        "title": "SF Downtown Pothole",
        "description": "Pothole on Market Street",
        "category_id": str(geo_category.id),
        "location": {"latitude": 37.7749, "longitude": -122.4194, "address": "Market St, SF"}
    }
    await client.post("/api/v1/issues", json=sf_issue, headers=geo_auth_headers)

    # 2. Create issue in Oakland (37.8044, -122.2712) ~ 13 km away
    oakland_issue = {
        "title": "Oakland Water Leak",
        "description": "Water leak near Broadway",
        "category_id": str(geo_category.id),
        "location": {"latitude": 37.8044, "longitude": -122.2712, "address": "Broadway, Oakland"}
    }
    await client.post("/api/v1/issues", json=oakland_issue, headers=geo_auth_headers)

    # 3. Query GeoJSON nearby SF center (37.7749, -122.4194) within 5 km radius -> Should return only SF issue
    response_5km = await client.get(
        "/api/v1/issues/nearby",
        params={"latitude": 37.7749, "longitude": -122.4194, "radius_km": 5.0}
    )
    assert response_5km.status_code == 200
    geojson_5km = response_5km.json()
    assert geojson_5km["type"] == "FeatureCollection"
    assert len(geojson_5km["features"]) == 1
    feature = geojson_5km["features"][0]
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] == "Point"
    assert feature["geometry"]["coordinates"] == [-122.4194, 37.7749]
    assert feature["properties"]["title"] == "SF Downtown Pothole"

    # 4. Query GeoJSON nearby SF center within 25 km radius -> Should return both SF and Oakland issues
    response_25km = await client.get(
        "/api/v1/issues/nearby",
        params={"latitude": 37.7749, "longitude": -122.4194, "radius_km": 25.0}
    )
    assert response_25km.status_code == 200
    geojson_25km = response_25km.json()
    assert len(geojson_25km["features"]) == 2
