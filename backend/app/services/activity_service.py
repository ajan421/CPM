from typing import List, Optional, Dict, Any
from ..models.activity import ActivityType, ActivityCreate, ActivityResponse
from ..database import get_supabase_client
from supabase import Client
import logging
import json

logger = logging.getLogger(__name__)

class ActivityService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def log_activity(
        self, 
        user_id: str, 
        activity_type: ActivityType, 
        target_id: str, 
        target_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[ActivityResponse]:
        """Log a new activity to the database"""
        try:
            activity_data = {
                "type": activity_type.value,
                "target_id": target_id,
                "target_name": target_name,
                "user_id": user_id,
                "metadata": json.dumps(metadata) if metadata else None
            }
            
            response = self.supabase.table("activities").insert(activity_data).execute()
            
            if response.data and len(response.data) > 0:
                return ActivityResponse(**response.data[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to log activity: {str(e)}")
            return None

    async def get_recent_activities(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[ActivityResponse]:
        """Get recent activities for projects/teams the user has access to"""
        try:
            # Get activities with user profile information
            response = self.supabase.table("activities").select(
                "*, profiles!activities_user_id_fkey(full_name, email)"
            ).order("created_at", desc=True).limit(limit).execute()
            
            activities = []
            for activity_data in response.data:
                # Extract profile data
                profile = activity_data.get("profiles")
                user_name = profile.get("full_name") if profile else None
                user_email = profile.get("email") if profile else None
                
                # Parse metadata if it exists
                metadata = None
                if activity_data.get("metadata"):
                    try:
                        metadata = json.loads(activity_data["metadata"])
                    except:
                        metadata = None
                
                activity = ActivityResponse(
                    id=activity_data["id"],
                    type=activity_data["type"],
                    target_id=activity_data["target_id"],
                    target_name=activity_data["target_name"],
                    user_id=activity_data["user_id"],
                    metadata=metadata,
                    created_at=activity_data["created_at"],
                    user_name=user_name,
                    user_email=user_email
                )
                activities.append(activity)
            
            return activities
            
        except Exception as e:
            logger.error(f"Failed to get recent activities: {str(e)}")
            return []

# Helper functions for logging specific activities
async def log_project_created(user_id: str, project_id: str, project_name: str, supabase: Client):
    service = ActivityService(supabase)
    await service.log_activity(
        user_id=user_id,
        activity_type=ActivityType.PROJECT_CREATED,
        target_id=project_id,
        target_name=project_name
    )

async def log_task_created(user_id: str, task_id: str, task_title: str, project_name: str, supabase: Client):
    service = ActivityService(supabase)
    await service.log_activity(
        user_id=user_id,
        activity_type=ActivityType.TASK_CREATED,
        target_id=task_id,
        target_name=task_title,
        metadata={"project_name": project_name}
    )

async def log_task_completed(user_id: str, task_id: str, task_title: str, project_name: str, supabase: Client):
    service = ActivityService(supabase)
    await service.log_activity(
        user_id=user_id,
        activity_type=ActivityType.TASK_COMPLETED,
        target_id=task_id,
        target_name=task_title,
        metadata={"project_name": project_name}
    )

async def log_team_created(user_id: str, team_id: str, team_name: str, supabase: Client):
    service = ActivityService(supabase)
    await service.log_activity(
        user_id=user_id,
        activity_type=ActivityType.TEAM_CREATED,
        target_id=team_id,
        target_name=team_name
    )

async def log_team_member_added(user_id: str, team_id: str, team_name: str, member_name: str, supabase: Client):
    service = ActivityService(supabase)
    await service.log_activity(
        user_id=user_id,
        activity_type=ActivityType.TEAM_MEMBER_ADDED,
        target_id=team_id,
        target_name=team_name,
        metadata={"member_name": member_name}
    ) 