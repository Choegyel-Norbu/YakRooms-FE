/**
 * iOS Safari Cross-Domain Authentication Detection
 * Determines if we need to use localStorage tokens instead of cookies
 */

import { API_BASE_URL } from '@/shared/services/firebaseConfig';

/**
 * Detect if we're running on iOS Safari
 */
export const isIOSSafari = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|edgios/.test(userAgent);
  
  return isIOS && isSafari;
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
    
    console.log('🔍 Domain check:', { currentDomain, apiDomain, currentETLD, apiETLD });
    
    return currentETLD !== apiETLD;
  } catch (error) {
    console.error('Failed to detect cross-domain scenario:', error);
    // Default to cross-domain for safety
    return true;
  }
};

/**
 * Determine if we should use cross-domain auth flow
 */
export const shouldUseCrossDomainAuth = () => {
  const iosCheck = isIOSSafari();
  const crossDomainCheck = isCrossDomain();
  const result = iosCheck && crossDomainCheck;
  
  console.log('🔍 Auth flow detection:', {
    isIOSSafari: iosCheck,
    isCrossDomain: crossDomainCheck,
    shouldUseCrossDomainAuth: result,
    userAgent: navigator.userAgent,
    currentDomain: window.location.hostname,
    apiDomain: API_BASE_URL
  });
  
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
    return 'iOS Safari cross-domain: Using localStorage tokens with X-Access-Token headers';
  }
  return 'Standard flow: Using HTTP-only cookies';
};
