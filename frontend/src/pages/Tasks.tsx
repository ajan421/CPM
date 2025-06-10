import React, { useState } from 'react';
import { Plus, List, Kanban } from 'lucide-react';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { Button } from '../components/common/Button';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Task } from '../types';
import { Modal } from '../components/common/Modal';
import { TaskForm } from '../components/tasks/TaskForm';

export const Tasks: React.FC = () => {
  const { tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask, isCreating, isUpdating } = useTasks();
  const { projects, isLoading: projectsLoading } = useProjects();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<Task['status']>('todo');

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskDelete = (id: string) => {
    deleteTask(id);
  };

  const handleCreateTask = (status: Task['status']) => {
    setEditingTask(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: Partial<Task>) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, task: data });
    } else {
      createTask(data);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          You need to create a project before you can create tasks.
        </p>
        <Button onClick={() => window.location.href = '/projects'}>
          Go to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and track your tasks across all projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Kanban className="h-4 w-4 mr-2 inline" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              List
            </button>
          </div>
          <Button onClick={() => handleCreateTask('todo')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Task Views */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
          onCreateTask={handleCreateTask}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              List view coming soon...
            </p>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskForm
          task={editingTask || undefined}
          initialStatus={initialStatus}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
};