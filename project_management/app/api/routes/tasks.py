from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...models.project import ProjectCreate, ProjectResponse, ProjectUpdate
from ...dependencies import get_current_user
from ...database import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate, 
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        project = {
            "name": project_data.name,
            "description": project_data.description,
            "status": project_data.status,
            "owner_id": current_user.id,
            "team_id": project_data.team_id
        }
        
        response = supabase.table("projects").insert(project).execute()
        
        if len(response.data) > 0:
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create project"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Project creation failed: {str(e)}"
        )

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Get projects owned by user
        owned_projects = supabase.table("projects").select("*").eq("owner_id", current_user.id).execute()
        
        # Get projects where user is a team member
        user_teams = supabase.table("team_members").select("team_id").eq("user_id", current_user.id).execute()
        team_ids = [team["team_id"] for team in user_teams.data]
        
        team_projects = []
        if team_ids:
            team_projects = supabase.table("projects").select("*").in_("team_id", team_ids).execute()
        
        # Combine and remove duplicates
        all_projects = owned_projects.data + [p for p in team_projects.data if p["owner_id"] != current_user.id]
        
        return all_projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        project = supabase.table("projects").select("*").eq("id", project_id).execute()
        
        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        # Check if user is owner or team member
        if project.data[0]["owner_id"] != current_user.id:
            # Check if user is in the project's team
            if project.data[0]["team_id"]:
                team_member = supabase.table("team_members").select("*").eq("team_id", project.data[0]["team_id"]).eq("user_id", current_user.id).execute()
                if not team_member.data:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Not authorized to access this project"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this project"
                )
                
        return project.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch project: {str(e)}"
        )

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if project exists and user is owner
        project = supabase.table("projects").select("*").eq("id", project_id).execute()
        
        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        if project.data[0]["owner_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this project"
            )
            
        # Update project
        update_data = {k: v for k, v in project_data.model_dump().items() if v is not None}
        
        response = supabase.table("projects").update(update_data).eq("id", project_id).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if project exists and user is owner
        project = supabase.table("projects").select("*").eq("id", project_id).execute()
        
        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        if project.data[0]["owner_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this project"
            )
            
        # Delete project tasks first
        supabase.table("tasks").delete().eq("project_id", project_id).execute()
        
        # Delete project
        supabase.table("projects").delete().eq("id", project_id).execute()
        
        return {"message": "Project and all associated tasks deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete project: {str(e)}"
        )