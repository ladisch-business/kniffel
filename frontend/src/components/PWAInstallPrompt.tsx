import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 border border-wood-medium dark:border-gray-600 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-wood-dark dark:text-paper-light mb-2">
            App installieren
          </h3>
          <p className="text-sm text-wood-medium dark:text-paper-medium mb-4">
            Installieren Sie Kniffel für schnellen Zugriff und ein besseres Spielerlebnis.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-2 bg-wood-dark hover:bg-wood-medium text-paper-light px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Installieren</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-wood-medium hover:text-wood-dark dark:text-paper-medium dark:hover:text-paper-light text-sm font-medium transition-colors"
            >
              Später
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-wood-medium hover:text-wood-dark dark:text-paper-medium dark:hover:text-paper-light ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
