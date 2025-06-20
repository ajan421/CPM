from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...models.project import ProjectCreate, ProjectResponse, ProjectUpdate, PublicProjectResponse
from ...dependencies import get_current_user, get_current_user_optional
from ...database import get_supabase_client
from ...services.activity_service import log_project_created
from supabase.client import Client
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
            # Log activity
            await log_project_created(
                user_id=current_user.id,
                project_id=response.data[0]["id"],
                project_name=response.data[0]["name"],
                supabase=supabase
            )
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
        logger.debug(f"Fetching projects for user: {current_user.id}")
        
        # Get all projects where user is owner
        owned_projects = supabase.table("projects").select("*").eq("owner_id", current_user.id).execute()
        logger.debug(f"Owned projects: {owned_projects.data}")
        
        # Get all team memberships
        team_memberships = supabase.table("team_members").select("team_id").eq("user_id", current_user.id).execute()
        logger.debug(f"Team memberships: {team_memberships.data}")
        
        # Get all projects where user is a team member
        team_projects = []
        if team_memberships.data:
            team_ids = [tm["team_id"] for tm in team_memberships.data]
            team_projects_response = supabase.table("projects").select("*").in_("team_id", team_ids).execute()
            team_projects = team_projects_response.data or []
            logger.debug(f"Team projects: {team_projects}")
        
        # Combine and deduplicate projects
        all_projects = owned_projects.data or []
        for project in team_projects:
            if project["owner_id"] != current_user.id:
                all_projects.append(project)
        
        logger.debug(f"All projects: {all_projects}")
        return all_projects
        
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}")
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

# Public/Guest Routes
@router.post("/{project_id}/share")
async def share_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Generate a shareable public link for a project"""
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
                detail="Only project owner can share projects"
            )
        
        # Generate public ID if not exists
        public_id = project.data[0].get("public_id")
        if not public_id:
            public_id = str(uuid.uuid4())
            supabase.table("projects").update({
                "public_id": public_id,
                "visibility": "link_only"
            }).eq("id", project_id).execute()
        
        return {
            "public_id": public_id,
            "share_url": f"/public/projects/{public_id}",
            "message": "Project is now shareable via public link"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to share project: {str(e)}"
        )

@router.get("/public/{public_id}", response_model=PublicProjectResponse)
async def get_public_project(
    public_id: str,
    current_user: dict = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase_client)
):
    """Get public project by shareable ID - no authentication required"""
    try:
        # Find project by public_id
        project = supabase.table("projects").select("*").eq("public_id", public_id).execute()
        
        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not publicly accessible"
            )
        
        project_data = project.data[0]
        
        # Check if project is actually public/shareable
        if project_data.get("visibility") not in ["public", "link_only"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Project is not publicly accessible"
            )
        
        # Return limited project info for public viewing
        return PublicProjectResponse(
            id=project_data["id"],
            name=project_data["name"],
            description=project_data["description"],
            status=project_data["status"],
            created_at=project_data["created_at"],
            updated_at=project_data["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch public project: {str(e)}"
        )

@router.get("/public/{public_id}/tasks")
async def get_public_project_tasks(
    public_id: str,
    current_user: dict = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase_client)
):
    """Get public project tasks - no authentication required"""
    try:
        # Find project by public_id
        project = supabase.table("projects").select("*").eq("public_id", public_id).execute()
        
        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not publicly accessible"
            )
        
        project_data = project.data[0]
        
        # Check if project is actually public/shareable
        if project_data.get("visibility") not in ["public", "link_only"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Project is not publicly accessible"
            )
        
        # Get tasks for this project (limited info for public viewing)
        tasks = supabase.table("tasks").select(
            "id, title, description, status, priority, due_date, created_at"
        ).eq("project_id", project_data["id"]).execute()
        
        return tasks.data or []
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch public project tasks: {str(e)}"
        )