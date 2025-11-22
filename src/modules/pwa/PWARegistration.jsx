import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import InstallPrompt from './components/InstallPrompt';

const PWARegistration = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerSW({
      onNeedRefresh() {
        // Reload automatically when new version is available
        window.location.reload();
      },
      onOfflineReady() {
      },
    });
  }, []);

  return <InstallPrompt />;
};

export default PWARegistration;