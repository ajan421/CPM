import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(email: string, password: string, fullName: string): Promise<{message: string, user_id: string}> {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<{access_token: string, token_type: string, user_id: string}> {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    
    const response = await api.post('/auth/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getUserProfile(userId: string, token?: string): Promise<User> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/users/profile/${userId}`, config);
    return response.data;
  }
};