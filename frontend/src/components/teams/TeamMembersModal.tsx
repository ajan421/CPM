import React from 'react';
import { X, UserPlus, Trash2, Mail, Search } from 'lucide-react';
import { Team, TeamMember, User } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useSearchUsers } from '../../hooks/useUsers';

interface TeamMembersModalProps {
  team: Team;
  members: TeamMember[];
  onClose: () => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  isLoading?: boolean;
  isAddingMember?: boolean;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  team,
  members,
  onClose,
  onAddMember,
  onRemoveMember,
  isLoading = false,
  isAddingMember = false,
}) => {
  const [searchEmail, setSearchEmail] = React.useState('');
  const [showAddMember, setShowAddMember] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsers(
    searchEmail,
    showAddMember && searchEmail.length >= 3
  );

  // Filter out users who are already members
  const availableUsers = searchResults.filter(
    user => !members.some(member => member.user_id === user.id)
  );

  const handleAddMember = (user: User) => {
    onAddMember(user.id);
    setSearchEmail('');
    setSelectedUser(null);
    setShowAddMember(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {team.name} - {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Member Section */}
          <div className="mb-6">
            {!showAddMember ? (
              <Button
                onClick={() => setShowAddMember(true)}
                className="mb-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            ) : (
              <div className="mb-4">
                <div className="flex space-x-2 mb-2">
                  <div className="flex-1 relative">
                    <Input
                      type="email"
                      placeholder="Search users by email..."
                      value={searchEmail}
                      onChange={handleSearchInputChange}
                      autoFocus
                    />
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false);
                      setSearchEmail('');
                      setSelectedUser(null);
                    }}
                    disabled={isAddingMember}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Search Results */}
                {searchEmail.length >= 3 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-500">Searching...</span>
                      </div>
                    ) : availableUsers.length > 0 ? (
                      availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAddMember(user)}
                          disabled={isAddingMember}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 disabled:opacity-50"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          {isAddingMember && (
                            <LoadingSpinner size="sm" />
                          )}
                        </button>
                      ))
                    ) : searchEmail.length >= 3 ? (
                      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No users found matching "{searchEmail}"
                      </div>
                    ) : null}
                  </div>
                )}

                {searchEmail.length > 0 && searchEmail.length < 3 && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Type at least 3 characters to search for users
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No members yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add members to start collaborating
                </p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                          {member.user?.full_name?.charAt(0).toUpperCase() || 
                           member.user?.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'owner' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {member.role === 'owner' ? 'Owner' : 'Member'}
                    </span>
                    
                    {member.role !== 'owner' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveMember(member.user_id)}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}; 