# project_management/app/models/project.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectVisibility(str, Enum):
    PRIVATE = "private"
    PUBLIC = "public"
    LINK_ONLY = "link_only"

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    status: ProjectStatus = ProjectStatus.PLANNING

class ProjectCreate(BaseModel):
    name: str
    description: str
    status: ProjectStatus = ProjectStatus.PLANNING
    team_id: Optional[str] = None
    visibility: ProjectVisibility = ProjectVisibility.PRIVATE

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    team_id: Optional[str] = None
    visibility: Optional[ProjectVisibility] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    status: ProjectStatus
    owner_id: str
    team_id: Optional[str] = None
    visibility: Optional[ProjectVisibility] = ProjectVisibility.PRIVATE  # Optional for backward compatibility
    public_id: Optional[str] = None  # For shareable links
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class PublicProjectResponse(BaseModel):
    """Limited project info for public/guest viewing"""
    id: str
    name: str
    description: str
    status: ProjectStatus
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True
