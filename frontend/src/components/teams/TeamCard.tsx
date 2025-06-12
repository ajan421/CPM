import React from 'react';
import { Users, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Team } from '../../types';
import { Button } from '../common/Button';

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onViewMembers: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onEdit,
  onDelete,
  onViewMembers,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {team.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {team.description || 'No description provided'}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{team.members?.length || 0} members</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {team.members && team.members.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {team.members.map((member) => (
                <span
                  key={member.user_id}
                  className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {member.user?.full_name || member.user_id}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(team);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Team
                </button>
                <button
                  onClick={() => {
                    onViewMembers(team);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Members
                </button>
                <button
                  onClick={() => {
                    onDelete(team.id);
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Team
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={() => onViewMembers(team)}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          View Members
        </Button>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}; 