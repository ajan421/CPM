from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ...models.activity import ActivityResponse
from ...services.activity_service import ActivityService
from ...dependencies import get_current_user
from ...database import get_supabase_client
from supabase import Client
from gotrue import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("/recent", response_model=List[ActivityResponse])
async def get_recent_activities(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Get recent activities for the current user"""
    try:
        if limit > 50:
            limit = 50  # Cap the limit to prevent excessive queries
            
        service = ActivityService(supabase)
        activities = await service.get_recent_activities(
            user_id=current_user.id,
            limit=limit
        )
        
        return activities
        
    except Exception as e:
        logger.error(f"Error fetching recent activities: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent activities"
        ) 