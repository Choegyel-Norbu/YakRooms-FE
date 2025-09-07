import axios from "axios";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/shared/utils/safariLocalStorage";
import { API_BASE_URL } from "./firebaseConfig";

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
  timeout: 10000, // 10 second timeout
});

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

    // Don't intercept refresh token endpoint to prevent infinite loops
    const isRefreshTokenEndpoint = originalRequest.url?.includes('/auth/refresh-token');
    
    // Handle 401 Unauthorized responses (token expired)
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshTokenEndpoint) {
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
        console.log('🔄 Access token expired, attempting refresh...');
        
        // Attempt to refresh the access token using cookie-based refresh
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200) {
          console.log('✅ Token refreshed successfully via cookies');
          
          // Process queued requests
          processQueue(null, 'refreshed');
          
          // Retry original request (cookies are automatically updated by server)
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
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
    // Since we can't read HTTP-only cookies, we'll use a time-based approach
    // Refresh every 13 minutes (2 minutes before 15-minute expiry)
    const lastRefresh = localStorage.getItem('lastTokenRefresh');
    if (!lastRefresh) return true;
    
    const lastRefreshTime = parseInt(lastRefresh, 10);
    const now = Date.now();
    const timeSinceRefresh = now - lastRefreshTime;
    
    // Refresh if more than 13 minutes (780 seconds) have passed
    return timeSinceRefresh > (13 * 60 * 1000);
  },

  // Manually refresh token
  async refreshToken() {
    try {
      console.log('🔄 Manually refreshing token...');
      
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        // Update last refresh time
        localStorage.setItem('lastTokenRefresh', Date.now().toString());
        console.log('✅ Manual token refresh successful');
        return true;
      } else {
        throw new Error('Manual token refresh failed');
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      
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
      // Clear all browser cookies
      clearAllCookies();
      
      // Clear sessionStorage and refresh tracking
      sessionStorage.clear();
      localStorage.removeItem('lastTokenRefresh');
      
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
