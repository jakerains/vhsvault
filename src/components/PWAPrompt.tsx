import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Laptop } from 'lucide-react';

export const PWAPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSupported, setInstallSupported] = useState(true);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|ipod/.test(ua)) {
      setPlatform('ios');
      // Show iOS prompt immediately if not in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
        setInstallSupported(true);
      }
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      setInstallSupported(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallSupported(false);
      return;
    }

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt || !installSupported) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[450px] bg-purple-900/90 backdrop-blur-sm p-6 rounded-lg border-2 border-purple-600 shadow-lg animate-float z-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {platform === 'ios' ? <Smartphone className="w-8 h-8 text-purple-300" /> : <Download className="w-8 h-8 text-purple-300" />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-300 font-['Press_Start_2P'] mb-2">Install App</h3>
          <p className="text-sm text-purple-200 mt-1">
            {platform === 'ios' ? (
              <>
                1. Tap <span className="inline-flex items-center px-2 py-1 bg-purple-800/50 rounded text-xs">Share <Download className="w-3 h-3 ml-1" /></span> below<br />
                2. Scroll down and tap "Add to Home Screen"<br />
                3. Tap "Add" in the top right
              </>
            ) : platform === 'android' ? (
              'Tap "Install" to add VHS Vault to your home screen for quick access!'
            ) : (
              'Install VHS Vault for the ultimate retro collection experience!'
            )}
          </p>
          <ul className="text-xs text-purple-300 mt-2 space-y-1">
            <li>• Full offline access to your collection</li>
            <li>• Faster loading times</li>
            <li>• Native app experience</li>
            <li>• Automatic updates</li>
          </ul>
          {platform !== 'ios' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleInstall}
                className="retro-button text-xs py-2 px-6 font-['Press_Start_2P']"
              >
                Install Now
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-xs text-purple-400 hover:text-purple-300 font-['Press_Start_2P']"
              >
                Maybe later
              </button>
            </div>
          )}
          {platform === 'ios' && (
            <div className="mt-4">
              <button
                onClick={() => setShowPrompt(false)}
                className="text-xs text-purple-400 hover:text-purple-300 font-['Press_Start_2P']"
              >
                Got it!
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-purple-400 hover:text-purple-300"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};