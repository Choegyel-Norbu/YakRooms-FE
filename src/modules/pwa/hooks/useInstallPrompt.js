import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA install prompt
 * Captures the beforeinstallprompt event and provides methods to trigger installation
 */
const useInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            // Store the event so it can be triggered later
            setDeferredPrompt(e);
            setIsInstallable(true);

        };

        // Listen for successful installation
        const handleAppInstalled = () => {
            
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    /**
     * Show the install prompt to the user
     * @returns {Promise<boolean>} - Returns true if user accepted, false if dismissed
     */
    const promptInstall = async () => {
        if (!deferredPrompt) {
            
            return false;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // Clear the deferredPrompt for next time
        setDeferredPrompt(null);
        setIsInstallable(false);

        return outcome === 'accepted';
    };

    return {
        isInstallable,
        isInstalled,
        promptInstall,
    };
};

export default useInstallPrompt;
