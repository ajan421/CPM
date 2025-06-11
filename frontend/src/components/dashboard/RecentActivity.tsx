import React from 'react';
import { Clock, FolderOpen, CheckSquare, Users, UserPlus, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useActivities } from '../../hooks/useActivities';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Activity } from '../../types';

const getIcon = (type: Activity['type']) => {
  switch (type) {
    case 'project_created':
    case 'project_updated':
    case 'project_deleted':
      return FolderOpen;
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
      return CheckSquare;
    case 'task_completed':
      return CheckSquare;
    case 'team_created':
    case 'team_updated':
    case 'team_deleted':
      return Users;
    case 'team_member_added':
      return UserPlus;
    case 'team_member_removed':
      return UserMinus;
    default:
      return Clock;
  }
};

const getColor = (type: Activity['type']) => {
  switch (type) {
    case 'project_created':
    case 'project_updated':
    case 'project_deleted':
      return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    case 'task_created':
    case 'task_updated':
    case 'task_deleted':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    case 'task_completed':
      return 'text-success-600 bg-success-100 dark:bg-success-900/20';
    case 'team_created':
    case 'team_updated':
    case 'team_deleted':
      return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    case 'team_member_added':
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'team_member_removed':
      return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  }
};

const getActivityText = (activity: Activity): string => {
  const userName = activity.user_name || 'Someone';
  
  switch (activity.type) {
    case 'project_created':
      return `${userName} created project ${activity.target_name}`;
    case 'project_updated':
      return `${userName} updated project ${activity.target_name}`;
    case 'project_deleted':
      return `${userName} deleted project ${activity.target_name}`;
    case 'task_created':
      return `${userName} created task ${activity.target_name}${activity.metadata?.project_name ? ` in ${activity.metadata.project_name}` : ''}`;
    case 'task_updated':
      return `${userName} updated task ${activity.target_name}`;
    case 'task_completed':
      return `${userName} completed task ${activity.target_name}${activity.metadata?.project_name ? ` in ${activity.metadata.project_name}` : ''}`;
    case 'task_deleted':
      return `${userName} deleted task ${activity.target_name}`;
    case 'team_created':
      return `${userName} created team ${activity.target_name}`;
    case 'team_updated':
      return `${userName} updated team ${activity.target_name}`;
    case 'team_deleted':
      return `${userName} deleted team ${activity.target_name}`;
    case 'team_member_added':
      return `${userName} added ${activity.metadata?.member_name || 'someone'} to ${activity.target_name}`;
    case 'team_member_removed':
      return `${userName} removed ${activity.metadata?.member_name || 'someone'} from ${activity.target_name}`;
    case 'user_joined':
      return `${userName} joined the platform`;
    default:
      return `${userName} performed an action on ${activity.target_name}`;
  }
};

export const RecentActivity: React.FC = () => {
  const { data: activities, isLoading, error } = useActivities(8);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h3>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Failed to load recent activities
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Please try refreshing the page
            </p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recent activities yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Start creating projects and tasks to see activities here
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, index) => {
                const Icon = getIcon(activity.type);
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== activities.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${getColor(activity.type)}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {getActivityText(activity)}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};