import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Teams: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teams
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Teams feature coming soon
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Collaborate with your team members and manage permissions.
          </p>
        </div>
      </div>
    </div>
  );
};