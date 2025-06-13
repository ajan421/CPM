from fastapi import WebSocket
from typing import Dict, Set, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections for chats and documents
        # Format: {chat_id/doc_id: {user_id: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        """Connect a user to a chat or document room"""
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            
        self.active_connections[room_id][user_id] = websocket
        logger.debug(f"User {user_id} connected to room {room_id}")
        
    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        """Disconnect a user from a chat or document room"""
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                
        logger.debug(f"User {user_id} disconnected from room {room_id}")
        
    async def broadcast_to_chat(
        self,
        chat_id: str,
        message: dict,
        exclude_user: Optional[str] = None
    ):
        """Broadcast a message to all users in a chat"""
        if chat_id not in self.active_connections:
            return
            
        disconnected_users = set()
        
        for user_id, websocket in self.active_connections[chat_id].items():
            if exclude_user and user_id == exclude_user:
                continue
                
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {str(e)}")
                disconnected_users.add(user_id)
                
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.active_connections[chat_id].pop(user_id, None)
            
        # Clean up empty chats
        if not self.active_connections[chat_id]:
            del self.active_connections[chat_id]
            
    async def broadcast_to_document(
        self,
        document_id: str,
        message: dict,
        exclude_user: Optional[str] = None
    ):
        """Broadcast an update to all users viewing a document"""
        if document_id not in self.active_connections:
            return
            
        disconnected_users = set()
        
        for user_id, websocket in self.active_connections[document_id].items():
            if exclude_user and user_id == exclude_user:
                continue
                
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending update to user {user_id}: {str(e)}")
                disconnected_users.add(user_id)
                
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.active_connections[document_id].pop(user_id, None)
            
        # Clean up empty documents
        if not self.active_connections[document_id]:
            del self.active_connections[document_id]
            
    def get_active_users(self, room_id: str) -> Set[str]:
        """Get all active users in a chat or document room"""
        if room_id not in self.active_connections:
            return set()
            
        return set(self.active_connections[room_id].keys()) 