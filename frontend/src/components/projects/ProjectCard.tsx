import React, { useState, useRef } from 'react';
import { Calendar, Users, MoreHorizontal, FolderOpen } from 'lucide-react';
import { Project } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  planning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
  in_progress: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  completed: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300',
  cancelled: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300',
};

const statusLabels = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const taskCount = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(task => task.status === 'done').length || 0;
  const progress = taskCount > 0 ? (completedTasks / taskCount) * 100 : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <FolderOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {project.name}
              </h3>
              <span className={clsx('inline-flex px-2 py-1 text-xs font-medium rounded-full', statusColors[project.status])}>
                {statusLabels[project.status]}
              </span>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Project options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(project);
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                      onDelete(project.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {project.description}
        </p>

        {taskCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedTasks}/{taskCount} tasks</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {project.team && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{project.team.name}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};