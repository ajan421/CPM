from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...models.team import TeamCreate, TeamResponse, TeamUpdate, TeamMemberAdd
from ...dependencies import get_current_user
from ...database import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate, 
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        team = {
            "name": team_data.name,
            "description": team_data.description,
            "owner_id": current_user.id,
        }
        
        response = supabase.table("teams").insert(team).execute()
        
        if len(response.data) > 0:
            # Add owner as a team member
            team_member = {
                "team_id": response.data[0]["id"],
                "user_id": current_user.id,
                "role": "owner"
            }
            supabase.table("team_members").insert(team_member).execute()
            
            return response.data[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create team"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Team creation failed: {str(e)}"
        )

@router.get("/", response_model=List[TeamResponse])
async def get_teams(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Get teams where user is a member
        user_teams = supabase.table("team_members").select("team_id").eq("user_id", current_user.id).execute()
        team_ids = [team["team_id"] for team in user_teams.data]
        
        if not team_ids:
            return []
            
        teams = supabase.table("teams").select("*").in_("id", team_ids).execute()
        
        return teams.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch teams: {str(e)}"
        )

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is a team member
        team_member = supabase.table("team_members").select("*").eq("team_id", team_id).eq("user_id", current_user.id).execute()
        
        if not team_member.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this team"
            )
                
        return team.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch team: {str(e)}"
        )

@router.post("/{team_id}/members", status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: str,
    member_data: TeamMemberAdd,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is the team owner
        if team.data[0]["owner_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the team owner can add members"
            )
            
        # Check if user to be added exists
        user_exists = supabase.table("profiles").select("id").eq("id", member_data.user_id).execute()
        
        if not user_exists.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        # Check if user is already a member
        existing_member = supabase.table("team_members").select("*").eq("team_id", team_id).eq("user_id", member_data.user_id).execute()
        
        if existing_member.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a team member"
            )
            
        # Add team member
        team_member = {
            "team_id": team_id,
            "user_id": member_data.user_id,
            "role": member_data.role
        }
        
        supabase.table("team_members").insert(team_member).execute()
        
        return {"message": "Team member added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add team member: {str(e)}"
        )

@router.get("/{team_id}/members", status_code=status.HTTP_200_OK)
async def get_team_members(
    team_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is a team member
        team_member = supabase.table("team_members").select("*").eq("team_id", team_id).eq("user_id", current_user.id).execute()
        
        if not team_member.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this team"
            )
                
        # Get all team members
        members = supabase.table("team_members").select("*, profiles(id, email, full_name)").eq("team_id", team_id).execute()
        
        return members.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch team members: {str(e)}"
        )

@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def remove_team_member(
    team_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is the team owner
        if team.data[0]["owner_id"] != current_user.id and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the team owner can remove members or members can remove themselves"
            )
            
        # Check if the user being removed is the owner
        if user_id == team.data[0]["owner_id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the team owner. Transfer ownership first."
            )
            
        # Check if user is a member
        member = supabase.table("team_members").select("*").eq("team_id", team_id).eq("user_id", user_id).execute()
        
        if not member.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not a team member"
            )
            
        # Remove team member
        supabase.table("team_members").delete().eq("team_id", team_id).eq("user_id", user_id).execute()
        
        return {"message": "Team member removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove team member: {str(e)}"
        )

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str,
    team_data: TeamUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is the team owner
        if team.data[0]["owner_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the team owner can update the team"
            )
            
        # Update team
        update_data = {k: v for k, v in team_data.model_dump().items() if v is not None}
        
        response = supabase.table("teams").update(update_data).eq("id", team_id).execute()
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update team: {str(e)}"
        )

@router.delete("/{team_id}")
async def delete_team(
    team_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        # Check if team exists
        team = supabase.table("teams").select("*").eq("id", team_id).execute()
        
        if not team.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
            
        # Check if user is the team owner
        if team.data[0]["owner_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the team owner can delete the team"
            )

        # Update projects that use this team
        supabase.table("projects").update({"team_id": None}).eq("team_id", team_id).execute()
            
        # Delete team members
        supabase.table("team_members").delete().eq("team_id", team_id).execute()
        
        # Delete team
        supabase.table("teams").delete().eq("id", team_id).execute()
        
        return {"message": "Team deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete team: {str(e)}")