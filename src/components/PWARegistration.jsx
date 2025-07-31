import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useMediaQuery from '@/hooks/useMediaQuery';

// Helper function to detect iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const PWARegistration = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Register service worker
    const updateSW = registerSW({
      onNeedRefresh() {
        if (isMobile) {
          toast.info("New version available! Click to update.", {
            action: {
              label: "Update",
              onClick: () => window.location.reload()
            },
            cancel: {
              label: "Later"
            }
          });
        }
      },
      onOfflineReady() {
        if (isMobile) {
          toast.success("App is ready for offline use!");
        }
      },
      onRegistered(swRegistration) {
        console.log('SW registered: ', swRegistration);
      },
      onRegisterError(error) {
        console.log('SW registration error', error);
      },
    });

    // Handle install prompt for Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isMobile && !isIOS()) {
        toast.info("Install YakRooms for a better experience!", {
          action: {
            label: "Install",
            onClick: handleInstall
          },
          cancel: {
            label: "Later"
          }
        });
      }
    };

    // Handle iOS install prompt (manual instructions)
    const showIOSInstallInstructions = () => {
      if (isMobile && isIOS()) {
        toast.info("To install YakRooms on your iPhone/iPad:", {
          description: "1. Tap the Share button (📤) in Safari\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to install",
          action: {
            label: "Got it",
            onClick: () => {}
          },
          cancel: {
            label: "Later"
          }
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode');
    }

    // Show iOS install instructions after a delay if on iOS mobile
    if (isMobile && isIOS()) {
      setTimeout(() => {
        showIOSInstallInstructions();
      }, 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);



  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          toast.success("YakRooms is being installed!");
        } else {
          console.log('User dismissed the install prompt');
          toast.info("Installation cancelled. You can install later from your browser menu.");
        }
      } catch (error) {
        console.error('Install prompt error:', error);
        toast.error("Installation failed. Please try again or install manually from your browser menu.");
      }
      setDeferredPrompt(null);
    }
  };



  return null;
};

export default PWARegistration; 