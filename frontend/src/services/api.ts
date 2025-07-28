import axios from 'axios';
import { GameSettings, Game, User, UserStatistics, Friend } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kniffel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kniffel_token');
      localStorage.removeItem('kniffel_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const gameAPI = {
  createGame: async (settings: GameSettings): Promise<Game> => {
    const response = await api.post('/games', settings);
    return response.data;
  },

  getPublicGames: async (): Promise<Game[]> => {
    const response = await api.get('/games/public');
    return response.data;
  },

  getGame: async (gameId: string): Promise<Game> => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  joinGame: async (gameId: string): Promise<void> => {
    await api.post(`/games/${gameId}/join`);
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/users/statistics');
    return response.data;
  },

  getFriends: async (): Promise<Friend[]> => {
    const response = await api.get('/users/friends');
    return response.data;
  },

  sendFriendRequest: async (username: string): Promise<Friend> => {
    const response = await api.post('/users/friends', { username });
    return response.data;
  },

  acceptFriendRequest: async (friendshipId: string): Promise<void> => {
    await api.put(`/users/friends/${friendshipId}/accept`);
  },

  rejectFriendRequest: async (friendshipId: string): Promise<void> => {
    await api.delete(`/users/friends/${friendshipId}/reject`);
  },

  addFriend: async (username: string): Promise<void> => {
    await api.post('/users/friends', { username });
  },

  acceptFriend: async (friendshipId: string): Promise<void> => {
    await api.put(`/users/friends/${friendshipId}/accept`);
  },

  removeFriend: async (friendshipId: string): Promise<void> => {
    await api.delete(`/users/friends/${friendshipId}`);
  },

  getLeaderboard: async (filter: string): Promise<any[]> => {
    const response = await api.get(`/users/leaderboard?filter=${filter}`);
    return response.data;
  },
};

export default api;
