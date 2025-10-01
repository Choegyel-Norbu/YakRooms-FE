import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component to handle root path issues and Safari compatibility
 * This ensures proper routing behavior across different browsers
 */
const RootPathHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Detect Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Handle Safari-specific routing issues
    if (isSafari || isIOS) {
      // Ensure proper navigation for Safari
      if (location.pathname === '/' && location.search === '' && location.hash === '') {
        // Force a re-render for Safari to properly load the landing page
        setTimeout(() => {
          if (window.location.pathname === '/') {
            // Trigger a state change to ensure Safari loads the page properly
            navigate('/', { replace: true });
          }
        }, 100);
      }
    }

    // Handle any URL fragments or query parameters that might interfere
    if (location.hash && location.hash.includes('#/')) {
      // Handle old hash-based routing if present
      const newPath = location.hash.replace('#/', '/');
      navigate(newPath, { replace: true });
    }

    // Log for debugging
    console.log('RootPathHandler - Current location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      isSafari,
      isIOS
    });
  }, [location, navigate]);

  return null;
};

export default RootPathHandler;
