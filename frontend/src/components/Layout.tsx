import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { 
  Home, 
  User, 
  Trophy, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Dice1
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/leaderboard', icon: Trophy, label: 'Bestenliste' },
    { path: '/settings', icon: Settings, label: 'Einstellungen' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="wood-texture shadow-wood border-b-2 border-wood-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Dice1 className="h-8 w-8 text-paper-light" />
                <span className="text-2xl font-bold text-paper-light font-serif">
                  Kniffel
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-wood-dark text-paper-light'
                      : 'text-paper-light hover:bg-wood-dark hover:text-paper-light'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-paper-light hover:bg-wood-dark transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="flex items-center space-x-2 text-paper-light">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-paper-light hover:bg-wood-dark transition-colors"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="wood-texture border-t-2 border-wood-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-paper-light text-sm">
            <p>&copy; 2024 Kniffel Game. Entwickelt mit React, TypeScript und Express.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
