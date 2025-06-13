from sqlalchemy import Table, Column, Integer, String, ForeignKey, DateTime, Boolean, JSON, Enum
from sqlalchemy.sql import func
from .database import metadata
import enum

# Chat tables
class ChatType(enum.Enum):
    DIRECT = "direct"
    GROUP = "group"
    PROJECT = "project"
    TEAM = "team"

class MessageType(enum.Enum):
    TEXT = "text"
    FILE = "file"
    SYSTEM = "system"

chats = Table(
    "chats",
    metadata,
    Column("id", String, primary_key=True),
    Column("type", Enum(ChatType), nullable=False),
    Column("name", String),
    Column("description", String),
    Column("created_by", String, ForeignKey("users.id"), nullable=False),
    Column("created_at", DateTime, server_default=func.now()),
    Column("updated_at", DateTime, server_default=func.now(), onupdate=func.now())
)

chat_participants = Table(
    "chat_participants",
    metadata,
    Column("chat_id", String, ForeignKey("chats.id"), primary_key=True),
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("last_read_at", DateTime),
    Column("created_at", DateTime, server_default=func.now())
)

messages = Table(
    "messages",
    metadata,
    Column("id", String, primary_key=True),
    Column("chat_id", String, ForeignKey("chats.id"), nullable=False),
    Column("sender_id", String, ForeignKey("users.id"), nullable=False),
    Column("content", String, nullable=False),
    Column("type", Enum(MessageType), nullable=False, default=MessageType.TEXT),
    Column("parent_id", String, ForeignKey("messages.id")),
    Column("reactions", JSON),
    Column("created_at", DateTime, server_default=func.now()),
    Column("updated_at", DateTime, server_default=func.now(), onupdate=func.now())
)

# Document tables
class DocumentType(enum.Enum):
    TEXT = "text"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    OTHER = "other"

class DocumentPermission(enum.Enum):
    VIEW = "view"
    COMMENT = "comment"
    EDIT = "edit"

documents = Table(
    "documents",
    metadata,
    Column("id", String, primary_key=True),
    Column("title", String, nullable=False),
    Column("content", String),
    Column("type", Enum(DocumentType), nullable=False, default=DocumentType.TEXT),
    Column("project_id", String, ForeignKey("projects.id")),
    Column("team_id", String, ForeignKey("teams.id")),
    Column("owner_id", String, ForeignKey("users.id"), nullable=False),
    Column("version", Integer, default=1),
    Column("last_modified_by", String, ForeignKey("users.id"), nullable=False),
    Column("created_at", DateTime, server_default=func.now()),
    Column("updated_at", DateTime, server_default=func.now(), onupdate=func.now())
)

document_versions = Table(
    "document_versions",
    metadata,
    Column("id", String, primary_key=True),
    Column("document_id", String, ForeignKey("documents.id"), nullable=False),
    Column("content", String, nullable=False),
    Column("created_by", String, ForeignKey("users.id"), nullable=False),
    Column("comment", String),
    Column("created_at", DateTime, server_default=func.now())
)

document_comments = Table(
    "document_comments",
    metadata,
    Column("id", String, primary_key=True),
    Column("document_id", String, ForeignKey("documents.id"), nullable=False),
    Column("content", String, nullable=False),
    Column("created_by", String, ForeignKey("users.id"), nullable=False),
    Column("parent_id", String, ForeignKey("document_comments.id")),
    Column("resolved", Boolean, default=False),
    Column("created_at", DateTime, server_default=func.now())
)

document_shares = Table(
    "document_shares",
    metadata,
    Column("document_id", String, ForeignKey("documents.id"), primary_key=True),
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("permission", Enum(DocumentPermission), nullable=False, default=DocumentPermission.VIEW),
    Column("created_at", DateTime, server_default=func.now())
)

document_collaborators = Table(
    "document_collaborators",
    metadata,
    Column("document_id", String, ForeignKey("documents.id"), primary_key=True),
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("cursor_position", JSON),
    Column("selection_range", JSON),
    Column("last_active", DateTime, server_default=func.now(), onupdate=func.now())
) 