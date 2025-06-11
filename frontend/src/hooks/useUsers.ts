import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { User } from '../types';

export const useSearchUsers = (email: string, enabled: boolean = true) => {
  return useQuery<User[]>({
    queryKey: ['users', 'search', email],
    queryFn: async () => {
      if (!email || email.length < 3) {
        return [];
      }
      const response = await api.get(`/users/search?email=${encodeURIComponent(email)}`);
      return response.data;
    },
    enabled: enabled && email.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}; 