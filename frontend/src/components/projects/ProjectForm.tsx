import React from 'react';
import { useForm } from 'react-hook-form';
import { Project } from '../../types';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: Project['status'];
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'planning',
    },
  });

  const handleFormSubmit = (data: ProjectFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Project Name"
        {...register('name', {
          required: 'Project name is required',
          minLength: {
            value: 2,
            message: 'Project name must be at least 2 characters',
          },
        })}
        error={errors.name?.message}
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
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          placeholder="Describe your project..."
        />
        {errors.description && (
          <p className="text-sm text-error-600 dark:text-error-400">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          {...register('status', { required: 'Status is required' })}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && (
          <p className="text-sm text-error-600 dark:text-error-400">
            {errors.status.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};