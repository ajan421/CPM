import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    green: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    yellow: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    red: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={clsx('p-3 rounded-lg', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {value}
                </div>
                {change && (
                  <div className={clsx(
                    'ml-2 flex items-baseline text-sm font-semibold',
                    change.trend === 'up' ? 'text-success-600' : 'text-error-600'
                  )}>
                    <span className="sr-only">
                      {change.trend === 'up' ? 'Increased' : 'Decreased'} by
                    </span>
                    {change.trend === 'up' ? '+' : '-'}{Math.abs(change.value)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};