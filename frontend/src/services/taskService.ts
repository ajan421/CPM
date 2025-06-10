import api from './api';
import { Task } from '../types';
import { AxiosError } from 'axios';

export const taskService = {
  async getTasks(projectId?: string): Promise<Task[]> {
    try {
      console.log('Making request to /tasks/ endpoint', { projectId });
      const params = projectId ? { project_id: projectId } : {};
      const response = await api.get('/tasks/', { params });
      console.log('Tasks response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      if (error instanceof AxiosError) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },

  async getTask(id: string): Promise<Task> {
    try {
      console.log(`Making request to /tasks/${id} endpoint`);
      const response = await api.get(`/tasks/${id}`);
      console.log('Task response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      if (error instanceof AxiosError) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    try {
      console.log('Making request to create task:', task);
      const response = await api.post('/tasks/', task);
      console.log('Create task response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      if (error instanceof AxiosError) {
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
      throw error;
    }
  },

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      throw error;
    }
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw error;
    }
  },
};