from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...models.task import TaskCreate, TaskResponse, TaskUpdate, TaskStatus
from ...dependencies import get_current_user
from ...database import get_supabase_client
from supabase.client import Client
from gotrue import User
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        logger.debug(f"Creating task with data: {task_data}")
        logger.debug(f"Current user: {current_user}")
        
        # Check if project exists and user has access
        project_query = supabase.table("projects").select("*").eq("id", task_data.project_id).execute()
        logger.debug(f"Project query result: {project_query.data}")
        
        if not project_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
            
        project = project_query.data[0]
        logger.debug(f"Found project: {project}")
        
        # Check if user has access to the project
        if project["owner_id"] != current_user.id:
            # Check if user is a team member
            if project["team_id"]:
                team_member_query = supabase.table("team_members").select("*").eq("team_id", project["team_id"]).eq("user_id", current_user.id).execute()
                logger.debug(f"Team member query result: {team_member_query.data}")
                if not team_member_query.data:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You don't have access to this project"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this project"
                )
        
        # Convert task data to dict and ensure all fields are properly formatted
        task = {
            "title": str(task_data.title).strip(),
            "description": str(task_data.description).strip() if task_data.description else None,
            "status": str(task_data.status.value),
            "priority": str(task_data.priority.value),
            "due_date": task_data.due_date.isoformat() if task_data.due_date else None,
            "project_id": str(task_data.project_id),
            "creator_id": str(current_user.id),
            "assignee_id": str(task_data.assignee_id) if task_data.assignee_id else None
        }
        
        logger.debug(f"Attempting to insert task with data: {task}")
        
        try:
            response = supabase.table("tasks").insert(task).execute()
            logger.debug(f"Task creation response: {response.data}")
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create task"
                )
                
            created_task = response.data[0]
            logger.debug(f"Successfully created task: {created_task}")
            return created_task
            
        except Exception as insert_error:
            logger.error(f"Database error during task creation: {str(insert_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(insert_error)}"
            )
        
    except HTTPException as he:
        logger.error(f"HTTP error during task creation: {str(he)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during task creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task creation failed: {str(e)}"
        )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    project_id: Optional[str] = None,
    task_status: Optional[TaskStatus] = None,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        logger.debug(f"GET /tasks/ endpoint called")
        logger.debug(f"Query params - project_id: {project_id}, task_status: {task_status}")
        logger.debug(f"Current user: {current_user}")
        
        # Build the base query for tasks
        query = supabase.table("tasks").select("*")
        logger.debug("Base query created")
        
        # Add filters if specified
        if project_id:
            query = query.eq("project_id", project_id)
            logger.debug(f"Added project filter: {project_id}")
        if task_status:
            query = query.eq("status", task_status)
            logger.debug(f"Added status filter: {task_status}")
        
        # Get all projects where user is owner
        logger.debug("Fetching owned projects")
        owned_projects = supabase.table("projects").select("id").eq("owner_id", current_user.id).execute()
        owned_project_ids = [p["id"] for p in (owned_projects.data or [])]
        logger.debug(f"Owned project IDs: {owned_project_ids}")
        
        # Get all team memberships
        logger.debug("Fetching team memberships")
        team_memberships = supabase.table("team_members").select("team_id").eq("user_id", current_user.id).execute()
        team_ids = [tm["team_id"] for tm in (team_memberships.data or [])]
        logger.debug(f"Team IDs: {team_ids}")
        
        # Get all projects where user is a team member
        team_projects = []
        if team_ids:
            logger.debug("Fetching team projects")
            team_projects_response = supabase.table("projects").select("id").in_("team_id", team_ids).execute()
            team_projects = team_projects_response.data or []
        team_project_ids = [p["id"] for p in team_projects]
        logger.debug(f"Team project IDs: {team_project_ids}")
        
        # Combine all accessible project IDs
        accessible_project_ids = list(set(owned_project_ids + team_project_ids))
        logger.debug(f"Accessible project IDs: {accessible_project_ids}")
        
        # Get tasks where user has access
        if accessible_project_ids:
            # Use Postgrest syntax for multiple conditions
            query_str = f"creator_id.eq.{current_user.id},assignee_id.eq.{current_user.id},project_id.in.({','.join(accessible_project_ids)})"
            logger.debug(f"Query string: {query_str}")
            query = query.or_(query_str)
        else:
            query_str = f"creator_id.eq.{current_user.id},assignee_id.eq.{current_user.id}"
            logger.debug(f"Query string: {query_str}")
            query = query.or_(query_str)
            
        logger.debug("Executing final query")
        tasks_response = query.execute()
        tasks = tasks_response.data or []
        logger.debug(f"Query response: {tasks_response}")
        logger.debug(f"All tasks: {tasks}")
        
        return tasks
        
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tasks: {str(e)}"
        )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        logger.debug(f"Fetching task: {task_id}")
        
        query = supabase.table("tasks").select("*").eq("id", task_id).or_(
            f"creator_id.eq.{current_user.id},"
            f"assignee_id.eq.{current_user.id},"
            f"project_id.in.(select id from projects where owner_id.eq.{current_user.id} or team_id.in.(select team_id from team_members where user_id.eq.{current_user.id}))"
        ).execute()
        
        if not query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or access denied"
            )
            
        return query.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch task: {str(e)}"
        )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        logger.debug(f"Updating task: {task_id}")
        
        # Check access
        task_query = supabase.table("tasks").select("*").eq("id", task_id).or_(
            f"creator_id.eq.{current_user.id},"
            f"assignee_id.eq.{current_user.id},"
            f"project_id.in.(select id from projects where owner_id.eq.{current_user.id})"
        ).execute()
        
        if not task_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or access denied"
            )
            
        # Update task
        update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update task"
            )
            
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task: {str(e)}"
        )

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        logger.debug(f"Deleting task: {task_id}")
        
        # Check access
        task_query = supabase.table("tasks").select("*").eq("id", task_id).or_(
            f"creator_id.eq.{current_user.id},"
            f"project_id.in.(select id from projects where owner_id.eq.{current_user.id})"
        ).execute()
        
        if not task_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or access denied"
            )
            
        # Delete task
        response = supabase.table("tasks").delete().eq("id", task_id).execute()
        
        return {"message": "Task deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete task: {str(e)}"
        )