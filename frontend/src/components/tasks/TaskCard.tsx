import React from 'react';
import { Calendar, User, AlertCircle, Clock } from 'lucide-react';
import { Task } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
  high: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

const priorityIcons = {
  low: null,
  medium: AlertCircle,
  high: AlertCircle,
  urgent: AlertCircle,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  const PriorityIcon = priorityIcons[task.priority];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center space-x-1">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
            priorityColors[task.priority]
          )}>
            {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-2">
        {task.assignee && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <User className="h-3 w-3 mr-2" />
            <span>{task.assignee.full_name}</span>
          </div>
        )}

        {task.due_date && (
          <div className={clsx(
            'flex items-center text-xs',
            isOverdue
              ? 'text-error-600 dark:text-error-400'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            <Calendar className="h-3 w-3 mr-2" />
            <span>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-2" />
          <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};