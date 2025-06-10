import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // First login to get the token
      const loginData = await authService.login(email, password);
      
      // Then fetch the user profile using the freshly obtained token
      const userProfile = await authService.getUserProfile(loginData.user_id, loginData.access_token);
      
      return {
        ...loginData,
        userProfile
      };
    },
    onSuccess: (data) => {
      const user = {
        id: data.user_id,
        email: data.userProfile.email,
        full_name: data.userProfile.full_name,
        created_at: data.userProfile.created_at,
      };
      login(user, data.access_token);
      toast.success('Welcome back!');
      
      // Navigate to the saved location or dashboard
      const savedLocation = location.state?.from?.pathname || '/dashboard';
      navigate(savedLocation, { replace: true });
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
      // First register the user
      const registerData = await authService.register(email, password, fullName);
      
      // Then login to get the token
      const loginData = await authService.login(email, password);
      
      // Finally fetch the user profile using the freshly obtained token
      const userProfile = await authService.getUserProfile(loginData.user_id, loginData.access_token);
      
      return {
        ...loginData,
        userProfile
      };
    },
    onSuccess: (data) => {
      const user = {
        id: data.user_id,
        email: data.userProfile.email,
        full_name: data.userProfile.full_name,
        created_at: data.userProfile.created_at,
      };
      login(user, data.access_token);
      toast.success('Welcome! Your account has been created successfully.');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    onError: () => {
      logout();
      navigate('/login');
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};