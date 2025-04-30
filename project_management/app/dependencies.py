from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
from .database import get_supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"api/v1/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), supabase: Client = Depends(get_supabase_client)):
    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )