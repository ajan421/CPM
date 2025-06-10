import React from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { Button } from '../common/Button';
import clsx from 'clsx';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onCreateTask: (status: Task['status']) => void;
}

const columns: { id: Task['status']; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'border-gray-300 dark:border-gray-600' },
  { id: 'todo', title: 'To Do', color: 'border-primary-300 dark:border-primary-600' },
  { id: 'in_progress', title: 'In Progress', color: 'border-warning-300 dark:border-warning-600' },
  { id: 'review', title: 'Review', color: 'border-secondary-300 dark:border-secondary-600' },
  { id: 'done', title: 'Done', color: 'border-success-300 dark:border-success-600' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskEdit,
  onTaskDelete,
  onCreateTask,
}) => {
  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className={clsx(
              'flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-t-4',
              column.color
            )}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {column.title}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({columnTasks.length})
                  </span>
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCreateTask(column.id)}
                  className="p-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};