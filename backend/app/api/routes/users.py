from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, List
from ...models.user import UserResponse
from ...database import get_supabase_client
from supabase import Client
from ...dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Get user profile from profiles table
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return UserResponse(**response.data[0])

        # If profile doesn't exist, create a minimal one automatically
        profile_payload = {
            "id": user_id,
            "email": current_user.email,
            "full_name": current_user.user_metadata.get("full_name", ""),
        }

        create_resp = supabase.table("profiles").insert(profile_payload).execute()
        if create_resp.data:
            return UserResponse(**create_resp.data[0])

        # If still no data, return 404
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    except Exception as e:
        logger.error(f"Error fetching user profile for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )

@router.get("/search", response_model=List[UserResponse])
async def search_users_by_email(
    email: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Search for users by email address"""
    try:
        if not email or len(email.strip()) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email must be at least 3 characters long"
            )
        
        # Search for users by email (case insensitive, partial match)
        response = supabase.table("profiles").select("*").ilike("email", f"%{email.strip()}%").limit(10).execute()
        
        if response.data:
            return [UserResponse(**user) for user in response.data]
        
        return []
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching users by email '{email}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search users"
        ) 