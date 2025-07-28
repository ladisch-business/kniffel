import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response = await authAPI.login(username, password);
          const { user, token } = response;
          
          set({
            user,
            token,
            isAuthenticated: true,
          });

          localStorage.setItem('kniffel_token', token);
          localStorage.setItem('kniffel_user', JSON.stringify(user));
          
          socketService.connect(token);
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Login failed');
        }
      },

      register: async (username: string, password: string) => {
        try {
          const response = await authAPI.register(username, password);
          const { user, token } = response;
          
          set({
            user,
            token,
            isAuthenticated: true,
          });

          localStorage.setItem('kniffel_token', token);
          localStorage.setItem('kniffel_user', JSON.stringify(user));
          
          socketService.connect(token);
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        localStorage.removeItem('kniffel_token');
        localStorage.removeItem('kniffel_user');
        
        socketService.disconnect();
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'kniffel-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
