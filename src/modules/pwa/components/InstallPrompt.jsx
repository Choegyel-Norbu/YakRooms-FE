import { useState, useEffect } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';

/**
 * Beautiful install prompt banner for PWA
 * Shows a sleek, modern UI to encourage app installation
 */
const InstallPrompt = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissedTimestamp = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTimestamp) {
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      const currentTime = Date.now();
      const hoursPassed = (currentTime - dismissedTime) / (1000 * 60 * 60);
      
      // If less than 24 hours have passed, keep it dismissed
      if (hoursPassed < 24) {
        setIsDismissed(true);
        return;
      }
      // If 24+ hours have passed, clear the old timestamp and show the prompt
      localStorage.removeItem('pwa-install-dismissed');
    }

    // Show banner with a slight delay for better UX
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Store the current timestamp when dismissed
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't render if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-down"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-5 transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3
              id="install-prompt-title"
              className="text-lg font-bold text-gray-900 mb-1"
            >
              Install Ezeeroom
            </h3>
            <p
              id="install-prompt-description"
              className="text-sm text-gray-600 leading-relaxed"
            >
              Get quick access and a better experience
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
            aria-label="Dismiss install prompt"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
