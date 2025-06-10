import React from 'react';
import { Clock, FolderOpen, CheckSquare, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'project' | 'task' | 'team';
  action: string;
  target: string;
  time: string;
  user: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'project',
    action: 'created',
    target: 'Website Redesign',
    time: new Date().toISOString(),
    user: 'John Doe',
  },
  {
    id: '2',
    type: 'task',
    action: 'completed',
    target: 'Design system documentation',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: 'Jane Smith',
  },
  {
    id: '3',
    type: 'team',
    action: 'joined',
    target: 'Development Team',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: 'Mike Johnson',
  },
];

const getIcon = (type: Activity['type']) => {
  switch (type) {
    case 'project':
      return FolderOpen;
    case 'task':
      return CheckSquare;
    case 'team':
      return Users;
    default:
      return Clock;
  }
};

const getColor = (type: Activity['type']) => {
  switch (type) {
    case 'project':
      return 'text-primary-600 bg-primary-100 dark:bg-primary-900/20';
    case 'task':
      return 'text-success-600 bg-success-100 dark:bg-success-900/20';
    case 'team':
      return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  }
};

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {mockActivities.map((activity, index) => {
              const Icon = getIcon(activity.type);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== mockActivities.length - 1 && (
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
                            <span className="font-medium">{activity.user}</span>{' '}
                            {activity.action}{' '}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};