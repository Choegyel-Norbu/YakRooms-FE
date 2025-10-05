import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

const PWARegistration = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerSW({
      onNeedRefresh() {
        // Reload automatically when new version is available
        window.location.reload();
      },
      onOfflineReady() {
        console.log('PWA ready for offline use');
      },
    });
  }, []);

  return null;
};

export default PWARegistration;