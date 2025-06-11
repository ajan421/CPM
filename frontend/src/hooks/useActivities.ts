import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Activity } from '../types';

export const useActivities = (limit: number = 10) => {
  return useQuery<Activity[]>({
    queryKey: ['activities', limit],
    queryFn: async () => {
      const response = await api.get(`/activities/recent?limit=${limit}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
}; 