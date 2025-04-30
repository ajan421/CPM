from ..database import get_supabase_client
from ..models.task import TaskCreate, TaskUpdate
from typing import List, Dict, Any, Optional

class TaskService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def create_task(self, task_data: TaskCreate, creator_id: str) -> Dict[str, Any]:
        task = task_data.model_dump()
        task["creator_id"] = creator_id
        
        response = self.supabase.table("tasks").insert(task).execute()
        
        if len(response.data) > 0:
            return response.data[0]
        
        raise Exception("Failed to create task")
    
    async def get_project_tasks(self, project_id: str) -> List[Dict[str, Any]]:
        response = self.supabase.table("tasks").select("*").eq("project_id", project_id).execute()
        
        return response.data
    
    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        response = self.supabase.table("tasks").select("*").eq("id", task_id).execute()
        
        if response.data:
            return response.data[0]
        
        return None
    
    async def update_task(self, task_id: str, task_data: TaskUpdate) -> Dict[str, Any]:
        update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
        
        response = self.supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        return response.data[0]
    
    async def delete_task(self, task_id: str) -> None:
        self.supabase.table("tasks").delete().eq("id", task_id).execute()
    
    async def get_user_assigned_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.supabase.table("tasks").select("*").eq("assignee_id", user_id).execute()
        
        return response.data