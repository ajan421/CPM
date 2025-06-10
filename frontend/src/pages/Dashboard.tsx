import React from 'react';
import { FolderOpen, CheckSquare, Users, Clock } from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { tasks, isLoading: tasksLoading, error: tasksError } = useTasks();

  // Show loading state
  if (projectsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (projectsError || tasksError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-error-600 dark:text-error-400 text-lg mb-4">
          {projectsError ? 'Failed to load projects' : 'Failed to load tasks'}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  // Initialize with empty arrays if data is undefined
  const projectsList = projects || [];
  const tasksList = tasks || [];

  const activeProjects = projectsList.filter(p => p.status === 'in_progress').length;
  const completedTasks = tasksList.filter(t => t.status === 'done').length;
  const overdueTasks = tasksList.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Projects"
          value={projectsList.length}
          icon={FolderOpen}
          color="blue"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Total Tasks"
          value={tasksList.length}
          icon={CheckSquare}
          color="yellow"
        />
        <StatsCard
          title="Overdue Tasks"
          value={overdueTasks}
          icon={Clock}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <FolderOpen className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Create New Project
                </span>
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-success-600 dark:text-success-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Add New Task
                </span>
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-secondary-600 dark:text-secondary-400 mr-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Create Team
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};