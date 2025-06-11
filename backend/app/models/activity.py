from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ActivityType(str, Enum):
    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_DELETED = "project_deleted"
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_COMPLETED = "task_completed"
    TASK_DELETED = "task_deleted"
    TEAM_CREATED = "team_created"
    TEAM_UPDATED = "team_updated"
    TEAM_DELETED = "team_deleted"
    TEAM_MEMBER_ADDED = "team_member_added"
    TEAM_MEMBER_REMOVED = "team_member_removed"
    USER_JOINED = "user_joined"

class ActivityCreate(BaseModel):
    type: ActivityType
    target_id: str
    target_name: str
    metadata: Optional[Dict[str, Any]] = None

class ActivityResponse(BaseModel):
    id: str
    type: ActivityType
    target_id: str
    target_name: str
    user_id: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    # Related data
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True 