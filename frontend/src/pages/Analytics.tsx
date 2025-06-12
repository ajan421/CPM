import React from 'react';
import { BarChart3, PieChart, Activity, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Analytics: React.FC = () => {
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const { data: teams, isLoading: isLoadingTeams } = useTeams();

  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingTeams;

  // Calculate project statistics
  const activeProjects = projects.filter(
    (project) => project.status === 'in_progress' || project.status === 'planning'
  ).length;
  const completedProjects = projects.filter(
    (project) => project.status === 'completed'
  ).length;

  // Calculate task statistics
  const completedTasks = tasks.filter(
    (task) => task.status === 'done'
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === 'in_progress' || task.status === 'review'
  ).length;
  const todoTasks = tasks.filter(
    (task) => task.status === 'todo' || task.status === 'backlog'
  ).length;
  
  // Calculate priority distribution
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  // Calculate overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  }).length;

  // Calculate team statistics
  const totalTeamMembers = teams?.reduce((acc, team) => {
    return acc + (team.members?.length || 0);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Project performance and insights
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
              <BarChart3 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Projects
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {projects.length}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-green-500 dark:text-green-400 font-medium">{activeProjects}</span> Active
            </div>
            <div>
              <span className="text-blue-500 dark:text-blue-400 font-medium">{completedProjects}</span> Completed
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tasks
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {tasks.length}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-green-500 dark:text-green-400 font-medium">{completedTasks}</span> Completed
            </div>
            <div>
              <span className="text-yellow-500 dark:text-yellow-400 font-medium">{inProgressTasks}</span> In Progress
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 font-medium">{todoTasks}</span> Todo
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Overdue Tasks
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {overdueTasks}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-red-500 dark:text-red-400 font-medium">{overdueTasks}</span> Need attention
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Team Members
              </h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalTeamMembers}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <span className="text-purple-500 dark:text-purple-400 font-medium">{teams?.length || 0}</span> Teams
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Task Status Distribution
          </h3>
          <div className="flex items-center justify-center h-64">
            {/* SVG Bar Chart */}
            <svg width="100%" height="100%" viewBox="0 0 300 200">
              {/* Chart background */}
              <rect x="40" y="10" width="250" height="150" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Y-axis */}
              <line x1="40" y1="10" x2="40" y2="160" stroke="#9ca3af" strokeWidth="1" />
              <text x="10" y="160" fill="currentColor" fontSize="12">0</text>
              <text x="10" y="110" fill="currentColor" fontSize="12">33%</text>
              <text x="10" y="60" fill="currentColor" fontSize="12">66%</text>
              <text x="10" y="10" fill="currentColor" fontSize="12">100%</text>
              
              {/* X-axis */}
              <line x1="40" y1="160" x2="290" y2="160" stroke="#9ca3af" strokeWidth="1" />
              
              {/* Bars */}
              <g>
                <rect x="70" y={160 - (completedTasks / tasks.length * 150)} width="40" height={(completedTasks / tasks.length * 150)} fill="#10b981" />
                <text x="90" y="180" fill="currentColor" fontSize="12" textAnchor="middle">Done</text>
              </g>
              <g>
                <rect x="140" y={160 - (inProgressTasks / tasks.length * 150)} width="40" height={(inProgressTasks / tasks.length * 150)} fill="#3b82f6" />
                <text x="160" y="180" fill="currentColor" fontSize="12" textAnchor="middle">In Progress</text>
              </g>
              <g>
                <rect x="210" y={160 - (todoTasks / tasks.length * 150)} width="40" height={(todoTasks / tasks.length * 150)} fill="#9ca3af" />
                <text x="230" y="180" fill="currentColor" fontSize="12" textAnchor="middle">Todo</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Task Priority Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Task Priority Distribution
          </h3>
          <div className="flex items-center justify-center h-64">
            {/* SVG Pie Chart */}
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#e5e7eb" />
              
              {/* Pie chart segments - simplified representation */}
              {tasks.length > 0 && (
                <>
                  {/* High Priority */}
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#ef4444" strokeWidth="45" 
                    strokeDasharray={`${(highPriorityTasks / tasks.length) * 283} 283`} />
                  
                  {/* Medium Priority */}
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f59e0b" strokeWidth="45" 
                    strokeDasharray={`${(mediumPriorityTasks / tasks.length) * 283} 283`} 
                    strokeDashoffset={`${-1 * (highPriorityTasks / tasks.length) * 283}`} />
                  
                  {/* Low Priority */}
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="#10b981" strokeWidth="45" 
                    strokeDasharray={`${(lowPriorityTasks / tasks.length) * 283} 283`} 
                    strokeDashoffset={`${-1 * ((highPriorityTasks + mediumPriorityTasks) / tasks.length) * 283}`} />
                </>
              )}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">High ({highPriorityTasks})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium ({mediumPriorityTasks})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Low ({lowPriorityTasks})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Project Status
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Completion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {projects.slice(0, 5).map((project) => {
                const projectTasks = tasks.filter(task => task.project_id === project.id);
                const completedProjectTasks = projectTasks.filter(task => task.status === 'done').length;
                const completionPercentage = projectTasks.length > 0 
                  ? Math.round((completedProjectTasks / projectTasks.length) * 100) 
                  : 0;
                
                return (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {completedProjectTasks}/{projectTasks.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {completionPercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 