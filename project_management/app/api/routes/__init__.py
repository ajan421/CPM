from fastapi import APIRouter
from .auth import router as auth_router
from .projects import router as projects_router
from .tasks import router as tasks_router
from .teams import router as teams_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(projects_router)
router.include_router(tasks_router)
router.include_router(teams_router)