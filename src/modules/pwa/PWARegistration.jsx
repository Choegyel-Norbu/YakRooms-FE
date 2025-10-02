import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

const PWARegistration = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Register service worker for basic PWA functionality
    const updateSW = registerSW({
      onNeedRefresh() {
        toast.info("New version available! Click to update.", {
          duration: 5000,
          action: {
            label: "Update",
            onClick: () => window.location.reload()
          },
          cancel: {
            label: "Later"
          }
        });
      },
      onRegistered(swRegistration) {
        console.log('Service Worker registered:', swRegistration);
      },
      onRegisterError(error) {
        console.log('Service Worker registration error:', error);
      },
    });

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      toast.info("Install Ezeeroom for a better experience!", {
        action: {
          label: "Install",
          onClick: handleInstall
        },
        cancel: {
          label: "Later"
        }
      });
    };

    const handleInstall = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA install outcome: ${outcome}`);
        setDeferredPrompt(null);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  // This component doesn't render anything
  return null;
};

export default PWARegistration;