import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { socketService } from './services/socket';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GameLobbyPage from './pages/GameLobbyPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const { isAuthenticated, setUser } = useAuthStore();
  const { darkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedToken = localStorage.getItem('kniffel_token');
    const savedUser = localStorage.getItem('kniffel_user');

    if (savedToken && savedUser && !isAuthenticated) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user, savedToken);
        socketService.connect(savedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('kniffel_token');
        localStorage.removeItem('kniffel_user');
      }
    }
  }, [isAuthenticated, setUser]);

  return (
    <div className="min-h-screen bg-wood-light dark:bg-anthracite-900 transition-colors duration-300">
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/lobby/:gameId" element={
          <ProtectedRoute>
            <Layout>
              <GameLobbyPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/game/:gameId" element={
          <ProtectedRoute>
            <Layout>
              <GamePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
