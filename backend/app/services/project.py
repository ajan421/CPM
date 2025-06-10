from ..database import get_supabase_client
from ..models.project import ProjectCreate, ProjectUpdate
from typing import List, Dict, Any, Optional

class ProjectService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def create_project(self, project_data: ProjectCreate, owner_id: str) -> Dict[str, Any]:
        project = {
            "name": project_data.name,
            "description": project_data.description,
            "status": project_data.status,
            "owner_id": owner_id,
            "team_id": project_data.team_id
        }
        
        response = self.supabase.table("projects").insert(project).execute()
        
        if len(response.data) > 0:
            return response.data[0]
        
        raise Exception("Failed to create project")
    
    async def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        # Get projects owned by user
        owned_projects = self.supabase.table("projects").select("*").eq("owner_id", user_id).execute()
        
        # Get projects where user is a team member
        user_teams = self.supabase.table("team_members").select("team_id").eq("user_id", user_id).execute()
        team_ids = [team["team_id"] for team in user_teams.data]
        
        team_projects = []
        if team_ids:
            team_projects = self.supabase.table("projects").select("*").in_("team_id", team_ids).execute()
        
        # Combine and remove duplicates
        all_projects = owned_projects.data + [p for p in team_projects.data if p["owner_id"] != user_id]
        
        return all_projects
    
    async def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        response = self.supabase.table("projects").select("*").eq("id", project_id).execute()
        
        if response.data:
            return response.data[0]
        
        return None
    
    async def update_project(self, project_id: str, project_data: ProjectUpdate) -> Dict[str, Any]:
        update_data = {k: v for k, v in project_data.model_dump().items() if v is not None}
        
        response = self.supabase.table("projects").update(update_data).eq("id", project_id).execute()
        
        return response.data[0]
    
    async def delete_project(self, project_id: str) -> None:
        # Delete project tasks first
        self.supabase.table("tasks").delete().eq("project_id", project_id).execute()
        
        # Delete project
        self.supabase.table("projects").delete().eq("id", project_id).execute()