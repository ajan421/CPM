import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TeamCard } from '../components/teams/TeamCard';
import { TeamForm, TeamFormData } from '../components/teams/TeamForm';
import { TeamMembersModal } from '../components/teams/TeamMembersModal';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useTeamMembers, useAddTeamMember, useRemoveTeamMember } from '../hooks/useTeams';
import { Team } from '../types';
import toast from 'react-hot-toast';

export const Teams: React.FC = () => {
  const [showTeamForm, setShowTeamForm] = React.useState(false);
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  // Queries and mutations
  const { data: teams, isLoading, error } = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  // Team members for the selected team
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useTeamMembers(
    selectedTeam?.id || ''
  );

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowTeamForm(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowTeamForm(true);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeamMutation.mutateAsync(teamId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleTeamSubmit = async (data: TeamFormData) => {
    try {
      if (editingTeam) {
        await updateTeamMutation.mutateAsync({
          id: editingTeam.id,
          ...data,
        });
      } else {
        await createTeamMutation.mutateAsync(data);
      }
      setShowTeamForm(false);
      setEditingTeam(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;

    try {
      await addMemberMutation.mutateAsync({
        teamId: selectedTeam.id,
        userId,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;

    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await removeMemberMutation.mutateAsync({
          teamId: selectedTeam.id,
          userId,
        });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your teams and collaborate with members
            </p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Failed to load teams. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teams
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button onClick={handleCreateTeam}>
          <Plus className="h-4 w-4 mr-2" />
          New Team
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
              onViewMembers={handleViewMembers}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No teams yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Create your first team to start collaborating with others.
            </p>
            <Button className="mt-4" onClick={handleCreateTeam}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </div>
        </div>
      )}

      {/* Team Form Modal */}
      {showTeamForm && (
        <TeamForm
          team={editingTeam}
          onSubmit={handleTeamSubmit}
          onCancel={() => {
            setShowTeamForm(false);
            setEditingTeam(null);
          }}
          isLoading={createTeamMutation.isPending || updateTeamMutation.isPending}
        />
      )}

      {/* Team Members Modal */}
      {selectedTeam && (
        <TeamMembersModal
          team={selectedTeam}
          members={teamMembers}
          onClose={() => setSelectedTeam(null)}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          isLoading={isLoadingMembers}
          isAddingMember={addMemberMutation.isPending}
        />
      )}
    </div>
  );
};