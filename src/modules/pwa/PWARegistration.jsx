import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import useMediaQuery from '@/shared/hooks/useMediaQuery';

// Helper function to detect iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const PWARegistration = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Register service worker for PWA features (no offline functionality)
    const updateSW = registerSW({
      onNeedRefresh() {
        if (isMobile) {
          toast.info("New version available! Click to update.", {
            duration: 6000,
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
      onRegistered(swRegistration) {
        console.log('SW registered: ', swRegistration);
      },
      onRegisterError(error) {
        console.log('SW registration error', error);
      },
    });

    // Handle install prompt for Android
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
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

    // Debug: Check PWA criteria
    console.log('PWA Debug Info:');
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Is Mobile:', isMobile);
    console.log('- Is iOS:', isIOS());
    console.log('- Display Mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('- HTTPS:', window.location.protocol === 'https:');
    
    // Check if the app meets installability criteria
    const checkInstallability = () => {
      const criteria = {
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasServiceWorker: 'serviceWorker' in navigator,
        isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        isNotStandalone: !window.matchMedia('(display-mode: standalone)').matches
      };
      
      console.log('Installability Criteria:', criteria);
      return criteria;
    };
    
    checkInstallability();

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
    console.log('handleInstall called, deferredPrompt:', !!deferredPrompt);
    
    if (deferredPrompt) {
      try {
        console.log('Calling deferredPrompt.prompt()');
        
        // Check if the prompt is still valid
        if (typeof deferredPrompt.prompt !== 'function') {
          throw new Error('Install prompt is no longer valid');
        }
        
        deferredPrompt.prompt();
        
        console.log('Waiting for user choice...');
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('User choice outcome:', outcome);
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
      setIsInstallable(false);
    } else {
      console.log('No deferredPrompt available');
      
      // Provide alternative installation instructions
      const alternativeMessage = isIOS() 
        ? "To install on iOS: Tap Share → Add to Home Screen"
        : "To install: Open browser menu → Add to Home Screen";
      
      toast.error(`Install prompt not available. ${alternativeMessage}`);
    }
  };

  // For debugging: Show install button if on mobile and not iOS
  if (isMobile && !isIOS() && process.env.NODE_ENV === 'development') {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <button
          onClick={handleInstall}
          disabled={!isInstallable}
          style={{
            padding: '10px 20px',
            backgroundColor: isInstallable ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '12px'
          }}
        >
          {isInstallable ? 'Install App' : 'Not Installable'}
        </button>
      </div>
    );
  }

  return null;
};

export default PWARegistration;
