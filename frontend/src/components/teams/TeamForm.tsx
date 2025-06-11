import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Team } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface TeamFormProps {
  team?: Team | null;
  onSubmit: (data: TeamFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TeamFormData {
  name: string;
  description: string;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<TeamFormData>({
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [team, reset]);

  const handleFormSubmit = (data: TeamFormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {team ? 'Edit Team' : 'Create New Team'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Team Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter team name"
              {...register('name', {
                required: 'Team name is required',
                minLength: {
                  value: 2,
                  message: 'Team name must be at least 2 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Team name must be less than 100 characters',
                },
              })}
              error={errors.name?.message}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Enter team description (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description must be less than 500 characters',
                },
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={!isValid || isLoading}
              loading={isLoading}
            >
              {team ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 