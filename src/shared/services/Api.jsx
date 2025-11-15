import axios from "axios";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/shared/utils/safariLocalStorage";
import { API_BASE_URL } from "./firebaseConfig";
import { toast } from "sonner";
import { shouldUseCrossDomainAuth } from "@/shared/utils/authDetection";
import { 
  getAccessToken, 
  getRefreshToken, 
  isUsingLocalStorageTokens, 
  clearTokens,
  updateTokensFromRefresh,
  hasValidTokens,
  shouldRefreshToken
} from "@/shared/utils/tokenStorage";

// Cookie-based authentication - no client-side token management needed


// Cookie-based authentication utilities
function clearAllCookies() {
  const cookies = document.cookie.split(";");
  
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear cookie for current domain
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    
    // Clear cookie for parent domain (if subdomain)
    if (window.location.hostname.includes('.')) {
      const parentDomain = window.location.hostname.substring(window.location.hostname.indexOf('.'));
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${parentDomain}`;
    }
  }
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Enable cookies for HTTP-only authentication
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minute timeout (120000ms)
});

// Add request interceptor to handle both auth methods
api.interceptors.request.use(
  (config) => {
    // Check if we're using localStorage tokens (iOS Safari cross-domain)
    if (isUsingLocalStorageTokens()) {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers['X-Access-Token'] = accessToken;
        console.log('📱 Added X-Access-Token header for iOS Safari cross-domain auth');
      }
      // Don't send cookies for cross-domain requests
      config.withCredentials = false;
    } else {
      // Standard cookie-based auth
      config.withCredentials = true;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for automatic token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors with user-friendly message
    const isTimeoutError = error.code === 'ECONNABORTED' || 
                          error.message?.includes('timeout') ||
                          (error.code === undefined && !error.response && error.message?.includes('exceeded'));
    
    if (isTimeoutError) {
      console.error('⏱️ Request timeout:', error);
      
      // Show user-friendly timeout error message
      toast.error('Request Timeout', {
        description: 'The request took too long to complete. Please check your internet connection and try again.',
        duration: 8000,
      });
      
      return Promise.reject(error);
    }

    // Don't intercept refresh token endpoint to prevent infinite loops
    const isRefreshTokenEndpoint = originalRequest.url?.includes('/auth/refresh-token');
    
    // Handle 401 Unauthorized and 403 Forbidden responses (token expired/invalid)
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isRefreshTokenEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Access token expired/invalid (401/403), attempting refresh...');
        
        // Determine refresh method based on auth type
        const usingLocalStorageTokens = isUsingLocalStorageTokens();
        let refreshConfig = {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000, // 2 minute timeout
        };
        
        if (usingLocalStorageTokens) {
          // iOS Safari cross-domain: Send refresh token in header
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available for cross-domain auth');
          }
          
          refreshConfig.headers['X-Refresh-Token'] = refreshToken;
          refreshConfig.withCredentials = false;
          console.log('📱 Refreshing token using X-Refresh-Token header');
        } else {
          // Standard cookie-based refresh
          refreshConfig.withCredentials = true;
          console.log('🍪 Refreshing token using cookies');
        }
        
        // Attempt to refresh the access token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, refreshConfig);
        
        if (response.status === 200) {
          console.log('✅ Token refreshed successfully');
          
          // Handle localStorage token updates for cross-domain auth
          if (usingLocalStorageTokens && response.data) {
            const updated = updateTokensFromRefresh({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              accessTokenExpiresIn: response.data.accessTokenExpiresIn,
              refreshTokenExpiresIn: response.data.refreshTokenExpiresIn
            });
            
            if (!updated) {
              throw new Error('Failed to update tokens after refresh');
            }
          }
          
          // Update both tracking keys to sync with AuthProvider
          const timestamp = Date.now().toString();
          setStorageItem('lastTokenRefresh', timestamp);
          setStorageItem('lastAuthCheck', timestamp);
          
          // Process queued requests
          processQueue(null, 'refreshed');
          
          // Retry original request
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Handle timeout errors during token refresh
        if (refreshError.code === 'ECONNABORTED' || refreshError.message?.includes('timeout')) {
          console.error('⏱️ Token refresh timeout during interceptor');
          toast.error('Connection Timeout', {
            description: 'Token refresh timed out. Please check your internet connection and try again.',
            duration: 8000,
          });
        }
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear auth state and redirect to login
        if (window.authLogout) {
          window.authLogout();
        } else {
          console.warn('⚠️ No global logout function found, redirecting to home');
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle refresh token endpoint failures specifically
    if (isRefreshTokenEndpoint) {
      if (error.response?.status === 401) {
        console.error('❌ Refresh token expired (401) - logging out');
        
        // Trigger logout for expired refresh token
        if (window.authLogout) {
          window.authLogout();
        } else {
          window.location.href = '/';
        }
        
        return Promise.reject(error);
      } else if (error.response?.status === 403) {
        console.error('❌ Refresh token forbidden (403) - clearing auth and redirecting');
        
        // For 403, clear auth data but don't trigger full logout flow
        // This handles cases where refresh token is invalid/forbidden
        try {
          authService.clearAuthData();
        } catch (clearError) {
          console.warn('⚠️ Failed to clear auth data:', clearError);
        }
        
        // Redirect to login page
        window.location.href = '/';
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication helper functions for cookie-based auth with refresh
export const authService = {
  // Check if we should proactively refresh (within 2 minutes of potential expiry)
  shouldRefreshProactively() {
    // For localStorage tokens, check actual token expiry
    if (isUsingLocalStorageTokens()) {
      return shouldRefreshToken();
    }
    
    // For cookie-based auth, use time-based approach since we can't read HTTP-only cookies
    // Refresh every 13 minutes (2 minutes before 15-minute expiry)
    // Use the same key as AuthProvider to avoid duplicate refreshes
    const lastRefresh = getStorageItem('lastAuthCheck') || getStorageItem('lastTokenRefresh');
    if (!lastRefresh) return true;
    
    const lastRefreshTime = parseInt(lastRefresh, 10);
    const now = Date.now();
    const timeSinceRefresh = now - lastRefreshTime;
    
    // Refresh if more than 13 minutes (780 seconds) have passed
    // Add 30 second buffer to prevent race conditions with periodic refresh
    return timeSinceRefresh > (13 * 60 * 1000 + 30 * 1000);
  },

  // Manually refresh token
  async refreshToken() {
    try {
      // Check if a refresh is already in progress (prevent duplicate calls)
      const lastRefresh = getStorageItem('lastTokenRefresh');
      const now = Date.now();
      if (lastRefresh) {
        const timeSinceRefresh = now - parseInt(lastRefresh, 10);
        // If refreshed within last 30 seconds, skip to prevent duplicate calls
        if (timeSinceRefresh < 30 * 1000) {
          console.log('⏭️ Token refresh skipped - refreshed recently');
          return true;
        }
      }
      
      console.log('🔄 Manually refreshing token...');
      
      // Determine refresh method based on auth type
      const usingLocalStorageTokens = isUsingLocalStorageTokens();
      let refreshConfig = {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 900000, // 15 minute timeout
      };
      
      if (usingLocalStorageTokens) {
        // iOS Safari cross-domain: Send refresh token in header
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available for manual refresh');
        }
        
        refreshConfig.headers['X-Refresh-Token'] = refreshToken;
        refreshConfig.withCredentials = false;
        console.log('📱 Manual refresh using X-Refresh-Token header');
      } else {
        // Standard cookie-based refresh
        refreshConfig.withCredentials = true;
        console.log('🍪 Manual refresh using cookies');
      }
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, refreshConfig);
      
      if (response.status === 200) {
        // Handle localStorage token updates for cross-domain auth
        if (usingLocalStorageTokens && response.data) {
          const updated = updateTokensFromRefresh({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            accessTokenExpiresIn: response.data.accessTokenExpiresIn,
            refreshTokenExpiresIn: response.data.refreshTokenExpiresIn
          });
          
          if (!updated) {
            throw new Error('Failed to update tokens after manual refresh');
          }
        }
        
        // Update both tracking keys to sync with AuthProvider
        const timestamp = Date.now().toString();
        setStorageItem('lastTokenRefresh', timestamp);
        setStorageItem('lastAuthCheck', timestamp);
        console.log('✅ Manual token refresh successful');
        return true;
      } else {
        throw new Error('Manual token refresh failed');
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('⏱️ Token refresh timeout');
        toast.error('Connection Timeout', {
          description: 'Token refresh timed out. Please check your internet connection and try again.',
          duration: 8000,
        });
        throw new Error('Token refresh timed out - please check your connection');
      }
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        console.error('❌ Refresh token forbidden (403) - clearing auth data');
        this.clearAuthData();
        throw new Error('Refresh token is forbidden - please login again');
      } else if (error.response?.status === 401) {
        console.error('❌ Refresh token expired (401)');
        throw new Error('Refresh token expired - please login again');
      }
      
      throw error;
    }
  },

  // Clear all authentication data
  clearAuthData() {
    try {
      // Clear localStorage tokens if using cross-domain auth
      if (isUsingLocalStorageTokens()) {
        clearTokens();
        console.log('🧹 Cleared localStorage tokens for cross-domain auth');
      }
      
      // Clear all browser cookies (for cookie-based auth)
      clearAllCookies();
      
      // Clear sessionStorage and refresh tracking
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch (sessionError) {
        console.warn('Failed to clear sessionStorage:', sessionError);
      }
      removeStorageItem('lastTokenRefresh');
      
      console.log('🧹 Authentication data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },

  // Logout function
  async logout() {
    try {
      // Call backend logout endpoint to invalidate cookies
      await api.post('/auth/logout');
      console.log('✅ Server-side logout successful');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all authentication data
      this.clearAuthData();
      
      console.log('🚪 User logged out successfully');
    }
  },

  // Get authentication method (for compatibility)
  getAuthMethod() {
    if (isUsingLocalStorageTokens()) {
      return "LOCALSTORAGE_TOKENS_WITH_HEADERS";
    }
    return "COOKIE_BASED_WITH_REFRESH";
  }
};

// Enhanced API instance with proactive refresh capability
const enhancedApi = {
  ...api,
  
  // Make authenticated request with proactive token refresh
  async authenticatedRequest(config) {
    try {
      // Check if we should proactively refresh before making request
      if (authService.shouldRefreshProactively()) {
        console.log('🔄 Proactively refreshing token before request');
        try {
          await authService.refreshToken();
        } catch (refreshError) {
          console.warn('⚠️ Proactive token refresh failed, will retry on 401', refreshError);
        }
      }
      
      return await api(config);
    } catch (error) {
      // If it's a 401 error, the interceptor will handle token refresh
      throw error;
    }
  },
  
  // Convenient methods for common HTTP operations with proactive refresh
  async get(url, config = {}) {
    return this.authenticatedRequest({ ...config, method: 'GET', url });
  },
  
  async post(url, data, config = {}) {
    return this.authenticatedRequest({ ...config, method: 'POST', url, data });
  },
  
  async put(url, data, config = {}) {
    return this.authenticatedRequest({ ...config, method: 'PUT', url, data });
  },
  
  async patch(url, data, config = {}) {
    return this.authenticatedRequest({ ...config, method: 'PATCH', url, data });
  },
  
  async delete(url, config = {}) {
    return this.authenticatedRequest({ ...config, method: 'DELETE', url });
  }
};

// Export both the basic api and enhanced version
export { enhancedApi };

// Make logout function available globally for interceptor
window.authLogout = () => {
  // This will be set by the AuthProvider
  console.warn('Global logout function called but not implemented yet');
};

export default api;
