from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase.client import Client
from .database import get_supabase_client
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), supabase: Client = Depends(get_supabase_client)):
    try:
        logger.debug("Authenticating user with token")
        response = supabase.auth.get_user(token)
        
        if not response or not response.user:
            logger.error("No user found in auth response")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        logger.debug(f"Authenticated user: {response.user.id}")
        return response.user
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_optional(token: str = Depends(oauth2_scheme), supabase: Client = Depends(get_supabase_client)):
    """Optional authentication - returns None if not authenticated"""
    try:
        if not token:
            return None
            
        response = supabase.auth.get_user(token)
        
        if not response or not response.user:
            return None
            
        return response.user
        
    except Exception:
        return None