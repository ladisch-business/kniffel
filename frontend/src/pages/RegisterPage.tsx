import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Dice1, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (username.length < 3) {
      toast.error('Benutzername muss mindestens 3 Zeichen lang sein');
      return;
    }

    if (password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    setIsLoading(true);
    try {
      await register(username.trim(), password);
      toast.success('Erfolgreich registriert!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registrierung fehlgeschlagen');
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
            Konto erstellen
          </h2>
          <p className="mt-2 text-sm text-wood-medium dark:text-paper-medium">
            Registrieren Sie sich für Kniffel
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
                placeholder="Mindestens 3 Zeichen"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-wood-medium rounded-md shadow-sm placeholder-wood-medium focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
                  placeholder="Mindestens 6 Zeichen"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-wood-dark dark:text-paper-light">
                Passwort bestätigen
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-wood-medium rounded-md shadow-sm placeholder-wood-medium focus:outline-none focus:ring-wood-medium focus:border-wood-medium dark:bg-anthracite-700 dark:border-anthracite-600 dark:text-paper-light"
                  placeholder="Passwort wiederholen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                {isLoading ? 'Registrieren...' : 'Registrieren'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-wood-medium dark:text-paper-medium">
                Bereits ein Konto?{' '}
                <Link
                  to="/login"
                  className="font-medium text-wood-dark dark:text-paper-light hover:text-wood-medium dark:hover:text-paper-medium transition-colors"
                >
                  Jetzt anmelden
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
