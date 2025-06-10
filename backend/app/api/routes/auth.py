from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any, Dict
from ...models.user import UserCreate, UserResponse
from ...database import get_supabase_client
from supabase.client import Client
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate, supabase: Client = Depends(get_supabase_client)):
    try:
        # Register user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "data": {
                "full_name": user_data.full_name
            }
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
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    supabase: Client = Depends(get_supabase_client)
):
    """
    Login endpoint that accepts form data directly.
    This is a simpler version that's easier to test.
    """
    try:
        logger.debug(f"Attempting login for email: {email}")
        
        # Try to sign in
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        logger.debug("Login successful")
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "user_id": auth_response.user.id
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

# Keep the token endpoint for OAuth compatibility
@router.post("/token")
async def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    supabase: Client = Depends(get_supabase_client)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    return await login(email=form_data.username, password=form_data.password, supabase=supabase)

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