/**
 * iOS WebKit Cross-Domain Authentication Detection
 * Determines if we need to use localStorage tokens instead of cookies
 * Applies to ALL iOS browsers (Safari, Chrome, Firefox, etc.) due to WebKit restrictions
 */

import { API_BASE_URL } from '@/shared/services/firebaseConfig';

/**
 * Detect if we're running on iOS (any browser)
 * All iOS browsers use WebKit and have the same cookie restrictions
 */
export const isIOS = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /ipad|iphone|ipod/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Detect if we're running on iOS Safari specifically
 */
export const isIOSSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOSDevice = isIOS();
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|edgios/.test(userAgent);
  
  return isIOSDevice && isSafari;
};

/**
 * Detect if we're running on iOS Chrome
 */
export const isIOSChrome = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOSDevice = isIOS();
  const isChrome = /crios/.test(userAgent) || (/chrome/.test(userAgent) && isIOSDevice);
  
  return isIOSDevice && isChrome;
};

/**
 * Detect if we're running on any iOS WebKit browser
 * This includes Safari, Chrome, Firefox, Edge, etc. on iOS
 */
export const isIOSWebKit = () => {
  return isIOS(); // All iOS browsers use WebKit and have cookie restrictions
};

/**
 * Detect if API is on different domain (cross-domain scenario)
 */
export const isCrossDomain = () => {
  try {
    const currentDomain = window.location.hostname;
    const apiUrl = new URL(API_BASE_URL);
    const apiDomain = apiUrl.hostname;
    
    // Extract eTLD+1 (registrable domain) for comparison
    const getCurrentETLD = (domain) => {
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return domain;
    };
    
    const currentETLD = getCurrentETLD(currentDomain);
    const apiETLD = getCurrentETLD(apiDomain);
    
    return currentETLD !== apiETLD;
  } catch (error) {
    // Default to cross-domain for safety
    return true;
  }
};

/**
 * Determine if we should use cross-domain auth flow
 * Now applies to ALL iOS browsers, not just Safari
 */
export const shouldUseCrossDomainAuth = () => {
  const iosWebKitCheck = isIOSWebKit();
  const crossDomainCheck = isCrossDomain();
  const result = iosWebKitCheck && crossDomainCheck;
  
  // Get specific browser info
  const iosSafari = isIOSSafari();
  const iosChrome = isIOSChrome();
  
  return result;
};

/**
 * Get appropriate auth endpoint based on detection
 */
export const getAuthEndpoint = () => {
  return shouldUseCrossDomainAuth() ? '/auth/firebase-cross-domain' : '/auth/firebase';
};

/**
 * Get auth method description for logging
 */
export const getAuthMethodDescription = () => {
  if (shouldUseCrossDomainAuth()) {
    const iosSafari = isIOSSafari();
    const iosChrome = isIOSChrome();
    
    if (iosSafari) {
      return 'iOS Safari cross-domain: Using localStorage tokens with X-Access-Token headers';
    } else if (iosChrome) {
      return 'iOS Chrome cross-domain: Using localStorage tokens with X-Access-Token headers';
    } else {
      return 'iOS WebKit cross-domain: Using localStorage tokens with X-Access-Token headers';
    }
  }
  return 'Standard flow: Using HTTP-only cookies';
};
