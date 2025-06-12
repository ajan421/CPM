from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    TEXT = "text"
    FILE = "file"
    SYSTEM = "system"

class ChatType(str, Enum):
    DIRECT = "direct"
    GROUP = "group"
    PROJECT = "project"
    TEAM = "team"

class ChatBase(BaseModel):
    type: ChatType
    name: Optional[str] = None  # Required for group chats
    description: Optional[str] = None

class ChatCreate(ChatBase):
    participants: List[str]  # List of user IDs

class ChatUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    type: MessageType = MessageType.TEXT
    parent_id: Optional[str] = None  # For thread replies

class MessageCreate(MessageBase):
    chat_id: str

class MessageUpdate(BaseModel):
    content: Optional[str] = None

class MessageResponse(MessageBase):
    id: str
    chat_id: str
    sender_id: str
    created_at: datetime
    updated_at: datetime
    reactions: Optional[dict] = None
    
    class Config:
        from_attributes = True

class ChatResponse(ChatBase):
    id: str
    created_by: str
    participants: List[str]
    created_at: datetime
    updated_at: datetime
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    
    class Config:
        from_attributes = True 