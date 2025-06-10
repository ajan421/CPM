import api from './api';
import { Team, TeamMember, User } from '../types';

export const teamService = {
  async getTeams(): Promise<Team[]> {
    const response = await api.get('/teams/');
    return response.data;
  },

  async getTeam(id: string): Promise<Team> {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  async createTeam(team: Partial<Team>): Promise<Team> {
    const response = await api.post('/teams/', team);
    return response.data;
  },

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  async addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const response = await api.post(`/teams/${teamId}/members`, { user_id: userId });
    return response.data;
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};