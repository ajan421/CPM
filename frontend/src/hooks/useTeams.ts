import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { Team, TeamMember } from '../types';
import toast from 'react-hot-toast';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getTeams,
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => teamService.getTeam(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create team:', error);
      toast.error(error.response?.data?.detail || 'Failed to create team');
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...team }: { id: string } & Partial<Team>) => 
      teamService.updateTeam(id, team),
    onSuccess: (updatedTeam) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', updatedTeam.id] });
      toast.success('Team updated successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to update team:', error);
      toast.error(error.response?.data?.detail || 'Failed to update team');
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete team:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete team');
    },
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => teamService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.addTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
      toast.success('Team member added successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to add team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to add team member');
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
      toast.success('Team member removed successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to remove team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to remove team member');
    },
  });
};