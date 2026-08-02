from fastapi import APIRouter
from src.presentation.api.v1.endpoints import auth, categories, health, issues, users

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(categories.router)
api_v1_router.include_router(issues.router)
