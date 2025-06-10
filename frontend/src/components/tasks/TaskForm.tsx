import React from 'react';
import { useForm } from 'react-hook-form';
import { Task, Project } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface TaskFormProps {
  task?: Task;
  initialStatus?: Task['status'];
  projects: Project[];
  onSubmit: (data: Partial<Task>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface TaskFormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  project_id: string;
  due_date?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  initialStatus = 'todo',
  projects,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || initialStatus,
      priority: task?.priority || 'medium',
      project_id: task?.project_id || (projects.length > 0 ? projects[0].id : ''),
      due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined,
    },
  });

  if (!projects.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          You need to create a project before you can create tasks.
        </p>
      </div>
    );
  }

  const handleFormSubmit = (data: TaskFormData) => {
    if (!data.project_id) {
      return;
    }
    
    // Log the raw form data
    console.log('Raw form data:', data);
    
    // Convert the date string to ISO format if it exists
    const formattedData = {
      ...data,
      // Ensure all fields are properly typed
      title: data.title.trim(),
      description: data.description.trim(),
      status: data.status as Task['status'],
      priority: data.priority as Task['priority'],
      project_id: data.project_id,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    };
    
    // Log the formatted data
    console.log('Formatted task data:', formattedData);
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Task Title"
        {...register('title', {
          required: 'Task title is required',
          minLength: {
            value: 2,
            message: 'Task title must be at least 2 characters',
          },
        })}
        error={errors.title?.message?.toString()}
        disabled={isLoading}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          {...register('description', {
            required: 'Description is required',
          })}
          rows={4}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Describe your task..."
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-error-600 dark:text-error-400">
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project
          </label>
          <select
            {...register('project_id', { required: 'Project is required' })}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {errors.project_id.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <select
            {...register('priority', { required: 'Priority is required' })}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {errors.priority && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {errors.priority.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          {errors.status && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {errors.status.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Due Date
          </label>
          <Input
            type="date"
            {...register('due_date')}
            error={errors.due_date?.message?.toString()}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}; 