from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any, Dict
from ...models.user import UserCreate, UserResponse
from ...database import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate, supabase: Client = Depends(get_supabase_client)):
    try:
        # Register user in Supabase Auth
        auth_response = supabase.auth.sign_up({
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
            
            supabase.table("profiles").insert(profile_data).execute()
            
            return {
                "message": "User registered successfully",
                "user_id": auth_response.user.id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to register user"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), supabase: Client = Depends(get_supabase_client)):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password,
        })
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user_id": auth_response.user.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
async def logout(supabase: Client = Depends(get_supabase_client)):
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )