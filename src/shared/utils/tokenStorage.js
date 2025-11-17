/**
 * Token Storage Utilities for Cross-Domain Auth
 * Handles localStorage token management for iOS Safari
 */

import { getStorageItem, setStorageItem, removeStorageItem } from './safariLocalStorage';

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'yakrooms_access_token',
  REFRESH_TOKEN: 'yakrooms_refresh_token',
  ACCESS_TOKEN_EXPIRY: 'yakrooms_access_token_expiry',
  REFRESH_TOKEN_EXPIRY: 'yakrooms_refresh_token_expiry',
  TOKEN_TYPE: 'yakrooms_token_type' // 'localStorage' or 'cookie'
};

/**
 * Store tokens from cross-domain auth response
 */
export const storeTokens = (tokenData) => {
  try {
    const now = Date.now();
    
    // Store access token and calculate expiry
    if (tokenData.accessToken) {
      setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, tokenData.accessToken);
      
      // Calculate expiry timestamp (accessTokenExpiresIn is in seconds)
      const accessTokenExpiry = now + (tokenData.accessTokenExpiresIn * 1000);
      setStorageItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY, accessTokenExpiry.toString());
    }
    
    // Store refresh token and calculate expiry
    if (tokenData.refreshToken) {
      setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, tokenData.refreshToken);
      
      // Calculate expiry timestamp (refreshTokenExpiresIn is in seconds)
      const refreshTokenExpiry = now + (tokenData.refreshTokenExpiresIn * 1000);
      setStorageItem(TOKEN_KEYS.REFRESH_TOKEN_EXPIRY, refreshTokenExpiry.toString());
    }
    
    // Mark that we're using localStorage tokens
    setStorageItem(TOKEN_KEYS.TOKEN_TYPE, 'localStorage');
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = () => {
  try {
    const token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiry = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY);
    
    if (!token || !expiry) {
      return null;
    }
    
    // Check if token is expired (with 30 second buffer)
    const now = Date.now();
    const expiryTime = parseInt(expiry, 10);
    const isExpired = now >= (expiryTime - 30000); // 30 second buffer
    
    if (isExpired) {
      return null;
    }
    
    return token;
  } catch (error) {
    return null;
  }
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  try {
    const token = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
    const expiry = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN_EXPIRY);
    
    if (!token || !expiry) {
      return null;
    }
    
    // Check if refresh token is expired
    const now = Date.now();
    const expiryTime = parseInt(expiry, 10);
    const isExpired = now >= expiryTime;
    
    if (isExpired) {
      clearTokens();
      return null;
    }
    
    return token;
  } catch (error) {
    return null;
  }
};

/**
 * Check if we have valid tokens
 */
export const hasValidTokens = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  // We need at least a refresh token to be considered authenticated
  return refreshToken !== null;
};

/**
 * Check if access token needs refresh
 */
export const shouldRefreshToken = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  // If we have refresh token but no valid access token, we should refresh
  return refreshToken !== null && accessToken === null;
};

/**
 * Clear all stored tokens
 */
export const clearTokens = () => {
  try {
    removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
    removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
    removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY);
    removeStorageItem(TOKEN_KEYS.TOKEN_TYPE);
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if we're using localStorage tokens (vs cookies)
 * This checks both stored token type AND current platform detection
 */
export const isUsingLocalStorageTokens = () => {
  const tokenType = getStorageItem(TOKEN_KEYS.TOKEN_TYPE);
  
  // If we have stored token type, use that (most reliable)
  if (tokenType === 'localStorage') {
    return true;
  }
  
  // If we have actual tokens stored, we're using localStorage
  const hasStoredTokens = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN) || getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
  if (hasStoredTokens) {
    return true;
  }
  
  // Only for authenticated requests when we don't have stored tokens yet,
  // check current platform detection inline
  try {
    // Inline iOS WebKit detection to avoid circular imports
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Only apply iOS detection if we're on iOS
    if (!isIOS) {
      return false;
    }
    
    // Check if API is cross-domain
    const currentDomain = window.location.hostname;
    const apiDomain = 'ezeeroom-production.up.railway.app'; // Hardcoded to avoid circular import
    
    const getCurrentETLD = (domain) => {
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return domain;
    };
    
    const currentETLD = getCurrentETLD(currentDomain);
    const apiETLD = getCurrentETLD(apiDomain);
    const isCrossDomain = currentETLD !== apiETLD;
    
    return isCrossDomain;
  } catch (error) {
    // Platform detection failed
    return false;
  }
};

/**
 * Update tokens from refresh response
 */
export const updateTokensFromRefresh = (refreshData) => {
  try {
    const now = Date.now();
    
    // Update access token if provided
    if (refreshData.accessToken) {
      setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, refreshData.accessToken);
      
      const accessTokenExpiry = now + (refreshData.accessTokenExpiresIn * 1000);
      setStorageItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY, accessTokenExpiry.toString());
    }
    
    // Update refresh token if provided (token rotation)
    if (refreshData.refreshToken) {
      setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, refreshData.refreshToken);
      
      const refreshTokenExpiry = now + (refreshData.refreshTokenExpiresIn * 1000);
      setStorageItem(TOKEN_KEYS.REFRESH_TOKEN_EXPIRY, refreshTokenExpiry.toString());
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get token info for debugging
 */
export const getTokenInfo = () => {
  try {
    const accessToken = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
    const accessTokenExpiry = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiry = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN_EXPIRY);
    const tokenType = getStorageItem(TOKEN_KEYS.TOKEN_TYPE);
    
    const now = Date.now();
    
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpiry: accessTokenExpiry ? new Date(parseInt(accessTokenExpiry, 10)).toISOString() : null,
      refreshTokenExpiry: refreshTokenExpiry ? new Date(parseInt(refreshTokenExpiry, 10)).toISOString() : null,
      accessTokenExpired: accessTokenExpiry ? now >= (parseInt(accessTokenExpiry, 10) - 30000) : null,
      refreshTokenExpired: refreshTokenExpiry ? now >= parseInt(refreshTokenExpiry, 10) : null,
      tokenType,
      isUsingLocalStorage: tokenType === 'localStorage'
    };
  } catch (error) {
    // Failed to get token info
    return null;
  }
};
