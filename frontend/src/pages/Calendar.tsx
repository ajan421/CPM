import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Task } from '../types';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, isLoading } = useTasks();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get tasks with due dates in the current month
  const tasksWithDueDate = tasks.filter(task => 
    task.due_date && isSameMonth(new Date(task.due_date), currentDate)
  );
  
  const getTasksForDay = (day: Date) => {
    return tasksWithDueDate.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), day)
    );
  };
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const getDayClass = (day: Date) => {
    const baseClass = "h-12 w-full border border-gray-200 dark:border-gray-700";
    
    if (!isSameMonth(day, currentDate)) {
      return `${baseClass} bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500`;
    }
    
    if (isToday(day)) {
      return `${baseClass} bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium`;
    }
    
    return `${baseClass} bg-white dark:bg-gray-800`;
  };
  
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
            Calendar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View your tasks and deadlines
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {daysInMonth.map((day, dayIdx) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day.toString()}
                className={getDayClass(day)}
              >
                <div className="p-2">
                  <div className="text-right text-sm">{format(day, 'd')}</div>
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.priority === 'high' || task.priority === 'urgent'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Upcoming tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upcoming Tasks
        </h3>
        {tasksWithDueDate.length > 0 ? (
          <div className="space-y-4">
            {tasksWithDueDate
              .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.project?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(task.due_date!), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming tasks with due dates
          </p>
        )}
      </div>
    </div>
  );
}; 