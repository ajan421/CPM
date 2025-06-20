export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  owner_id: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  team?: Team;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string;
  creator_id: string;
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  creator?: User;
  assignee?: User;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  members?: TeamMember[];
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: 'owner' | 'member' | 'admin';
  joined_at: string;
  user?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}

export type Theme = 'light' | 'dark';

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}

export interface Activity {
  id: string;
  type: 'project_created' | 'project_updated' | 'project_deleted' | 
        'task_created' | 'task_updated' | 'task_completed' | 'task_deleted' |
        'team_created' | 'team_updated' | 'team_deleted' | 
        'team_member_added' | 'team_member_removed' | 'user_joined';
  target_id: string;
  target_name: string;
  user_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  user_name?: string;
  user_email?: string;
}