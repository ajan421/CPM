from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    TEXT = "text"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    OTHER = "other"

class DocumentPermission(str, Enum):
    VIEW = "view"
    COMMENT = "comment"
    EDIT = "edit"

class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(default="")
    type: DocumentType = DocumentType.TEXT
    project_id: Optional[str] = None
    team_id: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[DocumentType] = None

class DocumentVersion(BaseModel):
    id: str
    document_id: str
    content: str
    created_by: str
    created_at: datetime
    comment: Optional[str] = None

class DocumentComment(BaseModel):
    id: str
    document_id: str
    content: str
    created_by: str
    created_at: datetime
    parent_id: Optional[str] = None  # For nested comments
    resolved: bool = False

class DocumentShare(BaseModel):
    user_id: str
    permission: DocumentPermission = DocumentPermission.VIEW

class DocumentResponse(DocumentBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    version: int
    shared_with: List[DocumentShare] = []
    last_modified_by: str
    
    class Config:
        from_attributes = True

class DocumentCollaborator(BaseModel):
    user_id: str
    cursor_position: Dict[str, int]  # For real-time collaboration
    selection_range: Optional[Dict[str, int]] = None
    last_active: datetime 