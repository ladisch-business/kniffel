import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Dice1, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Erfolgreich angemeldet!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light dark:bg-anthracite-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Dice1 className="h-16 w-16 text-wood-medium dark:text-paper-light" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-wood-dark dark:text-paper-light font-serif">
            Willkommen bei Kniffel
          </h2>
          <p className="mt-2 text-sm text-wood-medium dark:text-paper-medium">
            Melden Sie sich an, um zu spielen
          </p>
        </div>

        <div className="paper-texture rounded-lg shadow-paper p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-wood-dark dark:text-paper-light">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-wood-medium rounded-md shadow-sm placeholder-wood-medium focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
                placeholder="Ihr Benutzername"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-wood-dark dark:text-paper-light">
                Passwort
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-wood-medium rounded-md shadow-sm placeholder-wood-medium focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
                  placeholder="Ihr Passwort"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-wood-medium" />
                  ) : (
                    <Eye className="h-5 w-5 text-wood-medium" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-wood-medium dark:text-paper-medium">
                Noch kein Konto?{' '}
                <Link
                  to="/register"
                  className="font-medium text-wood-dark dark:text-paper-light hover:text-wood-medium dark:hover:text-paper-medium transition-colors"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
