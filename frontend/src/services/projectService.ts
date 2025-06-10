import api from './api';
import { Project } from '../types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects/');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await api.post('/projects/', project);
    return response.data;
  },

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};