import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Palette, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  LogOut,
  Zap
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { 
    darkMode, 
    soundSettings, 
    animationsEnabled, 
    toggleDarkMode, 
    setSoundEnabled, 
    setSoundVolume, 
    setAnimationsEnabled 
  } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundSettings.enabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoundVolume(parseFloat(e.target.value));
  };

  const handleAnimationsToggle = () => {
    setAnimationsEnabled(!animationsEnabled);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="paper-texture rounded-lg p-6">
        <h1 className="text-3xl font-bold text-wood-dark dark:text-paper-light font-serif mb-8 flex items-center">
          <Settings className="h-8 w-8 mr-3" />
          Einstellungen
        </h1>

        <div className="space-y-8">
          {/* User Settings */}
          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Benutzerkonto
            </h2>
            
            <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-wood-dark dark:text-paper-light">
                    Angemeldet als: {user?.username}
                  </div>
                  <div className="text-sm text-wood-medium dark:text-paper-medium">
                    Kniffel-Spieler
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Darstellung
            </h2>
            
            <div className="space-y-4">
              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wood-dark dark:text-paper-light">
                      Dunkler Modus
                    </div>
                    <div className="text-sm text-wood-medium dark:text-paper-medium">
                      Wechseln zwischen hellem und dunklem Design
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDarkModeToggle}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-wood-medium text-paper-light'
                        : 'bg-gray-200 text-wood-dark hover:bg-gray-300'
                    }`}
                  >
                    {darkMode ? (
                      <>
                        <Moon className="h-4 w-4" />
                        <span>Dunkel</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4" />
                        <span>Hell</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wood-dark dark:text-paper-light">
                      Animationen
                    </div>
                    <div className="text-sm text-wood-medium dark:text-paper-medium">
                      Würfel-Animationen und Übergangseffekte
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAnimationsToggle}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      animationsEnabled
                        ? 'bg-wood-medium text-paper-light'
                        : 'bg-gray-200 text-wood-dark hover:bg-gray-300'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>{animationsEnabled ? 'Ein' : 'Aus'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4 flex items-center">
              <Volume2 className="h-5 w-5 mr-2" />
              Audio
            </h2>
            
            <div className="space-y-4">
              <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-wood-dark dark:text-paper-light">
                      Soundeffekte
                    </div>
                    <div className="text-sm text-wood-medium dark:text-paper-medium">
                      Würfel-, Klick- und Spielsounds
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSoundToggle}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      soundSettings.enabled
                        ? 'bg-wood-medium text-paper-light'
                        : 'bg-gray-200 text-wood-dark hover:bg-gray-300'
                    }`}
                  >
                    {soundSettings.enabled ? (
                      <>
                        <Volume2 className="h-4 w-4" />
                        <span>Ein</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-4 w-4" />
                        <span>Aus</span>
                      </>
                    )}
                  </button>
                </div>

                {soundSettings.enabled && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-wood-dark dark:text-paper-light">
                        Lautstärke
                      </span>
                      <span className="text-sm text-wood-medium dark:text-paper-medium">
                        {Math.round(soundSettings.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={soundSettings.volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div>
            <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light mb-4">
              Über das Spiel
            </h2>
            
            <div className="bg-wood-light dark:bg-anthracite-700 rounded-lg p-4">
              <div className="space-y-2 text-sm text-wood-medium dark:text-paper-medium">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Entwickelt mit:</strong> React, TypeScript, Express.js</p>
                <p><strong>Spielmodi:</strong> Klassisches Kniffel, Eins muss weg, Multi-Block</p>
                <p><strong>Features:</strong> Turniere, Joker-Kniffel, Schnelles Spiel, KI-Gegner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
