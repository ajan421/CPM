import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { Task } from '../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ErrorResponse {
  detail: string;
}

export const useTasks = (projectId?: string) => {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      console.log('Fetching tasks...', { projectId });
      try {
        const tasks = await taskService.getTasks(projectId);
        console.log('Tasks fetched successfully:', tasks);
        return tasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    },
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retrying
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      console.log('Creating task:', task);
      try {
        const result = await taskService.createTask(task);
        console.log('Task created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Task creation error:', error);
      const message = error.response?.data?.detail || 'Failed to create task';
      toast.error(message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }) =>
      taskService.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.detail || 'Failed to update task';
      toast.error(message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.detail || 'Failed to delete task';
      toast.error(message);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  });
};