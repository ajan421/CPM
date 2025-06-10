from ..database import get_supabase_client
from ..models.user import UserCreate, UserResponse
from typing import Optional, Dict, Any

class AuthService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def register_user(self, user_data: UserCreate) -> Dict[str, Any]:
        # Register user in Supabase Auth
        auth_response = self.supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        if auth_response.user:
            # Store additional user data in profiles table
            profile_data = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name,
            }
            
            self.supabase.table("profiles").insert(profile_data).execute()
            
            return {
                "message": "User registered successfully",
                "user_id": auth_response.user.id
            }
        
        raise Exception("Failed to register user")
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        auth_response = self.supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user_id": auth_response.user.id
        }
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        response = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if response.data:
            return response.data[0]
        
        return None