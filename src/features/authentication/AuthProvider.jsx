import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem, 
  clearStorage,
  getAuthData,
  setAuthData,
  clearAuthData
} from "@/shared/utils/safariLocalStorage";
import api, { authService, enhancedApi } from "@/shared/services/Api";
import axios from "axios";
import { API_BASE_URL } from "@/shared/services/firebaseConfig";

// === Constants ===
const AUTH_STORAGE_KEYS = {
  USER_ID: 'userId',
  EMAIL: 'email',
  ROLES: 'roles', 
  ACTIVE_ROLE: 'activeRole',
  USER_NAME: 'userName',
  PICTURE_URL: 'pictureURL',
  REGISTER_FLAG: 'registerFlag',
  CLIENT_DETAIL_SET: 'clientDetailSet',
  HOTEL_ID: 'hotelId',
  HOTEL_IDS: 'hotelIds',
  SELECTED_HOTEL_ID: 'selectedHotelId',
  USER_HOTELS: 'userHotels',
  TOP_HOTEL_IDS: 'topHotelIds',
  REDIRECT_URL: 'redirectUrl',
  LAST_AUTH_CHECK: 'lastAuthCheck',
  SUBSCRIPTION_PAYMENT_STATUS: 'subscriptionPaymentStatus',
  SUBSCRIPTION_PLAN: 'subscriptionPlan',
  SUBSCRIPTION_IS_ACTIVE: 'subscriptionIsActive',
  SUBSCRIPTION_NEXT_BILLING_DATE: 'subscriptionNextBillingDate',
  SUBSCRIPTION_EXPIRATION_NOTIFICATION: 'subscriptionExpirationNotification'
};

// === Utility to check if we should validate authentication status ===
const shouldCheckAuthStatus = () => {
  try {
    const lastCheck = getStorageItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK);
    if (!lastCheck) return true;
    
    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    // Check every 13 minutes to align with token refresh cycle
    return (now - lastCheckTime) > (13 * 60 * 1000);
  } catch (error) {
    console.error("Failed to check last auth validation time", error);
    return true; // fallback to checking
  }
};

// === Utility to parse roles from storage ===
const parseRolesFromStorage = (rolesString) => {
  try {
    if (!rolesString) return [];
    
    // If it's already an array, return it
    if (Array.isArray(rolesString)) return rolesString;
    
    // If it's a single string (not JSON), wrap it in an array
    if (typeof rolesString === 'string' && !rolesString.startsWith('[')) {
      return [rolesString];
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(rolesString);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Failed to parse roles from storage", error);
    // If parsing fails, try to treat it as a single role string
    if (typeof rolesString === 'string') {
      return [rolesString];
    }
    return [];
  }
};

// === Utility to stringify roles for storage ===
const stringifyRolesForStorage = (roles) => {
  try {
    if (!Array.isArray(roles)) return '[]';
    return JSON.stringify(roles);
  } catch (error) {
    console.error("Failed to stringify roles for storage", error);
    return '[]';
  }
};

// === Utility to parse user hotels from storage ===
const parseUserHotelsFromStorage = (userHotelsString) => {
  try {
    if (!userHotelsString) return [];
    
    // If it's already an array, return it
    if (Array.isArray(userHotelsString)) return userHotelsString;
    
    // Try to parse as JSON
    const parsed = JSON.parse(userHotelsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse user hotels from storage", error);
    return [];
  }
};

// === Utility to stringify user hotels for storage ===
const stringifyUserHotelsForStorage = (userHotels) => {
  try {
    if (!Array.isArray(userHotels)) return '[]';
    return JSON.stringify(userHotels);
  } catch (error) {
    console.error("Failed to stringify user hotels for storage", error);
    return '[]';
  }
};

// === Utility to parse hotel IDs from storage ===
const parseHotelIdsFromStorage = (hotelIdsString) => {
  try {
    if (!hotelIdsString) return [];
    
    // If it's already an array, return it
    if (Array.isArray(hotelIdsString)) return hotelIdsString;
    
    // If it's a single string (not JSON), wrap it in an array
    if (typeof hotelIdsString === 'string' && !hotelIdsString.startsWith('[')) {
      return [hotelIdsString];
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(hotelIdsString);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Failed to parse hotel IDs from storage", error);
    // If parsing fails, try to treat it as a single ID string
    if (typeof hotelIdsString === 'string') {
      return [hotelIdsString];
    }
    return [];
  }
};

// === Utility to stringify hotel IDs for storage ===
const stringifyHotelIdsForStorage = (hotelIds) => {
  try {
    if (!Array.isArray(hotelIds)) return '[]';
    return JSON.stringify(hotelIds);
  } catch (error) {
    console.error("Failed to stringify hotel IDs for storage", error);
    return '[]';
  }
};

// === Utility to parse top hotel IDs from storage ===
const parseTopHotelIdsFromStorage = (topHotelIdsString) => {
  try {
    if (!topHotelIdsString) return [];
    
    // If it's already an array, return it
    if (Array.isArray(topHotelIdsString)) return topHotelIdsString;
    
    // If it's a single string (not JSON), wrap it in an array
    if (typeof topHotelIdsString === 'string' && !topHotelIdsString.startsWith('[')) {
      return [topHotelIdsString];
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(topHotelIdsString);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Failed to parse top hotel IDs from storage", error);
    // If parsing fails, try to treat it as a single ID string
    if (typeof topHotelIdsString === 'string') {
      return [topHotelIdsString];
    }
    return [];
  }
};

// === Utility to stringify top hotel IDs for storage ===
const stringifyTopHotelIdsForStorage = (topHotelIds) => {
  try {
    if (!Array.isArray(topHotelIds)) return '[]';
    return JSON.stringify(topHotelIds);
  } catch (error) {
    console.error("Failed to stringify top hotel IDs for storage", error);
    return '[]';
  }
};

// === Context Setup ===
const AuthContext = createContext(null);

const defaultAuthState = {
  isAuthenticated: false,
  email: "",
  roles: [],
  activeRole: null,
  clientDetailSet: false,
  userName: "",
  registerFlag: false,
  pictureURL: "",
  userId: "",
  flag: false,
  hotelId: null,
  hotelIds: [],
  selectedHotelId: null,
  userHotels: [],
  topHotelIds: [],
  isValidatingAuth: false, // New flag for auth validation state
  subscriptionPaymentStatus: null,
  subscriptionPlan: null,
  subscriptionIsActive: null,
};

export const AuthProvider = ({ children }) => {
  console.log("🔧 AuthProvider rendering...");
  const navigate = useNavigate();

  // Initialize auth state from localStorage with cookie-based authentication
  const [authState, setAuthState] = useState(() => {
    try {
      // Check if we have basic user data stored (indicates previous authentication)
      const userId = getStorageItem(AUTH_STORAGE_KEYS.USER_ID);
      const email = getStorageItem(AUTH_STORAGE_KEYS.EMAIL);
      
      // If we have user data, assume authenticated (server will validate via cookies)
      const hasUserData = userId && email;

      const authData = {
        isAuthenticated: hasUserData,
        email: email || "",
        roles: parseRolesFromStorage(getStorageItem(AUTH_STORAGE_KEYS.ROLES)),
        activeRole: getStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE),
        clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
        userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME) || "",
        registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
        pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL) || "",
        userId: userId || "",
        flag: false,
        hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
        hotelIds: parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS)),
        selectedHotelId: getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID) || null,
        userHotels: parseUserHotelsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS)),
        topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
        isValidatingAuth: hasUserData, // Will validate with server if we think we're authenticated
        subscriptionPaymentStatus: getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_PAYMENT_STATUS) || null,
        subscriptionPlan: getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_PLAN) || null,
        subscriptionIsActive: getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_IS_ACTIVE) === "true" ? true : 
                             getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_IS_ACTIVE) === "false" ? false : null,
        subscriptionNextBillingDate: getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_NEXT_BILLING_DATE) || null,
        subscriptionExpirationNotification: getStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_EXPIRATION_NOTIFICATION) === "true",
      };

      return authData;
    } catch (error) {
      console.error("Failed to initialize auth state", error);
      return defaultAuthState;
    }
  });

  const [lastLogin, setLastLogin] = useState(() => {
    const stored = getStorageItem("lastLogin");
    return stored ? new Date(stored) : null;
  });

  // === FETCH SUBSCRIPTION DATA (memoized) ===
  const fetchSubscriptionData = useCallback(async (userId) => {
    try {
      if (!userId) return null;
      
      console.log("🔍 Fetching subscription data for user:", userId);
      const response = await axios.get(`${API_BASE_URL}/api/subscriptions/user/${userId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        console.log("✅ Subscription data fetched successfully");
        
        const subscriptionData = response.data;
        
        // Update localStorage with subscription data
        setStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_PAYMENT_STATUS, subscriptionData.paymentStatus);
        setStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_PLAN, subscriptionData.subscriptionPlan);
        setStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_IS_ACTIVE, Boolean(subscriptionData.isActive).toString());
        setStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_NEXT_BILLING_DATE, subscriptionData.nextBillingDate || '');
        setStorageItem(AUTH_STORAGE_KEYS.SUBSCRIPTION_EXPIRATION_NOTIFICATION, Boolean(subscriptionData.expirationNotification).toString());
        
        // Update auth state
        setAuthState(prev => ({
          ...prev,
          subscriptionPaymentStatus: subscriptionData.paymentStatus,
          subscriptionPlan: subscriptionData.subscriptionPlan,
          subscriptionIsActive: subscriptionData.isActive,
          subscriptionNextBillingDate: subscriptionData.nextBillingDate,
          subscriptionExpirationNotification: subscriptionData.expirationNotification,
        }));
        
        return subscriptionData;
      } else {
        throw new Error('Invalid subscription response');
      }
    } catch (error) {
      console.error("❌ Failed to fetch subscription data:", error);
      
      // Don't clear auth state for subscription errors, just log them
      if (error.response?.status === 404) {
        console.log("ℹ️ No subscription found for this hotel");
      }
      
      return null;
    }
  }, []);

  // === FETCH USER HOTELS (memoized) ===
  const fetchUserHotels = useCallback(async (userId) => {
    try {
      if (!userId) return [];
      
      console.log("🔍 Fetching user hotels for user:", userId);
      const response = await axios.get(`${API_BASE_URL}/api/hotels/user/${userId}/all`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        console.log("✅ User hotels fetched successfully");
        
        const hotels = Array.isArray(response.data) ? response.data : [response.data];
        
        // Update localStorage with user hotels
        setStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS, stringifyUserHotelsForStorage(hotels));
        
        // Update auth state
        setAuthState(prev => ({
          ...prev,
          userHotels: hotels,
        }));
        
        return hotels;
      } else {
        throw new Error('Invalid user hotels response');
      }
    } catch (error) {
      console.error("❌ Failed to fetch user hotels:", error);
      
      // Don't clear auth state for hotel fetch errors, just log them
      if (error.response?.status === 404) {
        console.log("ℹ️ No hotels found for this user");
      }
      
      return [];
    }
  }, []);

  // === VALIDATE AUTH STATUS WITH SERVER (memoized) ===
  const validateAuthStatus = useCallback(async () => {
    try {
      console.log("🔍 Validating authentication status with server...");
      setAuthState(prev => ({ ...prev, isValidatingAuth: true }));
      
      // Call backend to validate current authentication status via cookies
      const response = await axios.get(`${API_BASE_URL}/auth/status`, {
        withCredentials: true, // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data.success && response.data.user) {
        console.log("✅ Authentication validated successfully");
        
        const userData = response.data.user;
        const roles = userData.roles || [];
        const initialActiveRole = getStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE) || 
                                 (roles.includes('HOTEL_ADMIN') ? 'HOTEL_ADMIN' :
                                  roles.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' :
                                  roles.includes('STAFF') ? 'STAFF' :
                                  roles.includes('GUEST') ? 'GUEST' :
                                  roles[0] || null);

        // Update localStorage with current user data
        setStorageItem(AUTH_STORAGE_KEYS.USER_ID, userData.id);
        setStorageItem(AUTH_STORAGE_KEYS.EMAIL, userData.email);
        setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(roles));
        setStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE, initialActiveRole);
        setStorageItem(AUTH_STORAGE_KEYS.USER_NAME, userData.name || "");
        setStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL, userData.profilePicUrl || "");
        setStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET, Boolean(userData.detailSet).toString());
        
        // Handle hotelIds array from server response
        if (userData.hotelIds && Array.isArray(userData.hotelIds)) {
          setStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS, stringifyHotelIdsForStorage(userData.hotelIds));
          // Set the first hotelId as the primary hotelId for backward compatibility
          if (userData.hotelIds.length > 0) {
            setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, userData.hotelIds[0]);
          }
        } else if (userData.hotelId) {
          // Fallback to single hotelId if hotelIds array is not provided
          setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, userData.hotelId);
          setStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS, stringifyHotelIdsForStorage([userData.hotelId]));
        }
        
        setStorageItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now().toString());
        
        // Update auth state
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          email: userData.email,
          userId: userData.id,
          userName: userData.name || "",
          roles: roles,
          activeRole: initialActiveRole,
          pictureURL: userData.profilePicUrl || "",
          clientDetailSet: Boolean(userData.detailSet),
          hotelId: userData.hotelIds && userData.hotelIds.length > 0 ? userData.hotelIds[0] : (userData.hotelId || prev.hotelId),
          hotelIds: userData.hotelIds && Array.isArray(userData.hotelIds) ? userData.hotelIds : (userData.hotelId ? [userData.hotelId] : prev.hotelIds),
          isValidatingAuth: false,
        }));
        
        // Fetch subscription data if user has userId
        if (userData.id) {
          await fetchSubscriptionData(userData.id);
        }
        
        return true;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (error) {
      console.error("❌ Auth validation failed:", error);
      
      // Check if it's a 401/403 (authentication expired) or other error
      if (error.response?.status === 401) {
        console.log("🚪 Authentication expired (401), clearing state");
        
        // Clear auth state for expired authentication
        setAuthState({
          ...defaultAuthState,
          topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
          hotelIds: parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS)),
          selectedHotelId: getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID) || null,
          userHotels: parseUserHotelsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS))
        });
        
        // Clear user data but preserve top hotel IDs, hotel IDs, selected hotel ID, and user hotels
        const authKeys = Object.values(AUTH_STORAGE_KEYS).filter(key => 
          key !== 'topHotelIds' && key !== 'hotelIds' && key !== 'selectedHotelId' && key !== 'userHotels' && key !== 'lastAuthCheck'
        );
        authKeys.forEach(key => {
          removeStorageItem(key);
        });
      } else if (error.response?.status === 403) {
        console.log("🚪 Authentication forbidden (403), clearing state");
        
        // For 403, clear auth data more aggressively
        setAuthState({
          ...defaultAuthState,
          topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
          hotelIds: parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS)),
          selectedHotelId: getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID) || null,
          userHotels: parseUserHotelsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS))
        });
        
        // Clear user data but preserve top hotel IDs, hotel IDs, selected hotel ID, and user hotels
        const authKeys = Object.values(AUTH_STORAGE_KEYS).filter(key => 
          key !== 'topHotelIds' && key !== 'hotelIds' && key !== 'selectedHotelId' && key !== 'userHotels' && key !== 'lastAuthCheck'
        );
        authKeys.forEach(key => {
          removeStorageItem(key);
        });
        
        // Also clear cookies for 403
        try {
          authService.clearAuthData();
        } catch (clearError) {
          console.warn('⚠️ Failed to clear auth data:', clearError);
        }
      } else {
        // For other errors (network issues, etc.), just clear validation flag
        console.log("⚠️ Validation failed due to network/server error, maintaining auth state");
        setAuthState(prev => ({ ...prev, isValidatingAuth: false }));
      }
      
      return false;
    }
  }, [fetchSubscriptionData]);

  // === LOGOUT (memoized) ===
  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out...");
      
      // Preserve top hotel IDs, hotel IDs, selected hotel ID, and user hotels during logout
      const topHotelIds = getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS);
      const hotelIds = getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS);
      const selectedHotelId = getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID);
      const userHotels = getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS);
      console.log("🔒 [LOGOUT] Preserving top hotel IDs:", topHotelIds);
      console.log("🔒 [LOGOUT] Preserving hotel IDs:", hotelIds);
      console.log("🔒 [LOGOUT] Preserving selected hotel ID:", selectedHotelId);
      console.log("🔒 [LOGOUT] Preserving user hotels:", userHotels);
      
      // Call backend logout endpoint to invalidate cookies
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          withCredentials: true, // Important: include cookies for authentication
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("✅ Server-side logout successful");
      } catch (logoutError) {
        console.warn("⚠️ Server-side logout failed, continuing with client cleanup:", logoutError);
      }
      
      // Clear all auth data from localStorage except top hotel IDs, hotel IDs, selected hotel ID, and user hotels
      const authKeys = Object.values(AUTH_STORAGE_KEYS).filter(key => 
        key !== 'topHotelIds' && key !== 'hotelIds' && key !== 'selectedHotelId' && key !== 'userHotels' && key !== 'lastAuthCheck'
      );
      authKeys.forEach(key => {
        removeStorageItem(key);
      });
      
      // Clear all cookies (redundant but safer)
      try {
        authService.clearAuthData();
      } catch (clearError) {
        console.warn("⚠️ Failed to clear auth data via authService:", clearError);
      }
      
      // Restore top hotel IDs, hotel IDs, selected hotel ID, and user hotels after clearing
      if (topHotelIds) {
        setStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS, topHotelIds);
        console.log("🔒 [LOGOUT] Restored top hotel IDs to localStorage");
      }
      if (hotelIds) {
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS, hotelIds);
        console.log("🔒 [LOGOUT] Restored hotel IDs to localStorage");
      }
      if (selectedHotelId) {
        setStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID, selectedHotelId);
        console.log("🔒 [LOGOUT] Restored selected hotel ID to localStorage");
      }
      if (userHotels) {
        setStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS, userHotels);
        console.log("🔒 [LOGOUT] Restored user hotels to localStorage");
      }
      
      setAuthState({
        ...defaultAuthState,
        topHotelIds: parseTopHotelIdsFromStorage(topHotelIds),
        hotelIds: parseHotelIdsFromStorage(hotelIds),
        selectedHotelId: selectedHotelId || null,
        userHotels: parseUserHotelsFromStorage(userHotels)
      });
      
      navigate("/");
      
      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Failed to logout properly:", error);
      
      // Fallback cleanup if logout fails
      try {
        // Clear localStorage
        const authKeys = Object.values(AUTH_STORAGE_KEYS).filter(key => 
          key !== 'topHotelIds' && key !== 'hotelIds' && key !== 'selectedHotelId' && key !== 'userHotels' && key !== 'lastAuthCheck'
        );
        authKeys.forEach(key => {
          removeStorageItem(key);
        });
        
        setAuthState({
          ...defaultAuthState,
          topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
          hotelIds: parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS)),
          selectedHotelId: getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID) || null,
          userHotels: parseUserHotelsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS))
        });
        navigate("/");
      } catch (fallbackError) {
        console.error("❌ Fallback logout cleanup failed:", fallbackError);
        window.location.href = '/';
      }
    }
  }, [navigate]);

  // === Set global logout function for API interceptor ===
  useEffect(() => {
    window.authLogout = logout;
    return () => {
      window.authLogout = () => {
        console.warn('Global logout function called but AuthProvider is unmounted');
      };
    };
  }, [logout]);

  // === REFRESH TOKEN PERIODICALLY (memoized) ===
  const refreshTokenPeriodically = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) return;
      
      console.log("🔄 Periodically refreshing token...");
      
      // Call refresh token endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log("✅ Periodic token refresh successful");
        // Update last refresh time for tracking
        setStorageItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now().toString());
      } else {
        console.warn("⚠️ Periodic token refresh returned non-200 status:", response.status);
      }
    } catch (error) {
      console.error("❌ Periodic token refresh failed:", error);
      
      // If refresh fails with 401/403, trigger logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("🚪 Token refresh failed with auth error, logging out");
        logout();
      }
    }
  }, [authState.isAuthenticated, logout]);

  // === Auto-validate authentication status ===
  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        // Only validate if we think we're authenticated or if we're in validation state
        if (!authState.isAuthenticated && !authState.isValidatingAuth) return;
        
        // Check if we should validate (not too frequently)
        if (!shouldCheckAuthStatus() && authState.isAuthenticated && !authState.isValidatingAuth) {
          return;
        }
        
        console.log("🔍 Auto-validating authentication status...");
        await validateAuthStatus();
      } catch (error) {
        console.error("❌ Auto-validation failed:", error);
      }
    };
    
    // Validate immediately if needed
    validateAuthentication();
    
    // Set up periodic validation (every 13 minutes to align with token refresh)
    const validationInterval = setInterval(() => {
      if (authState.isAuthenticated && shouldCheckAuthStatus()) {
        validateAuthentication();
      }
    }, 13 * 60 * 1000); // 13 minutes
    
    return () => {
      clearInterval(validationInterval);
    };
  }, [authState.isAuthenticated, authState.isValidatingAuth, validateAuthStatus]);

  // === PERIODIC TOKEN REFRESH (separate from validation) ===
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    
    // Set up periodic token refresh every 13 minutes
    const refreshInterval = setInterval(() => {
      refreshTokenPeriodically();
    }, 13 * 60 * 1000); // 13 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [authState.isAuthenticated, refreshTokenPeriodically]);

  // === Listen to storage changes (cross-tab sync) ===
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Sync user data changes across tabs
      if (e.key === AUTH_STORAGE_KEYS.USER_ID) {
        const userId = e.newValue;
        
        if (!userId) {
          // User logged out in another tab
          logout();
        } else {
          // Sync auth state with other tabs
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            email: getStorageItem(AUTH_STORAGE_KEYS.EMAIL),
            roles: parseRolesFromStorage(getStorageItem(AUTH_STORAGE_KEYS.ROLES)),
            activeRole: getStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE),
            userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME),
            userId: getStorageItem(AUTH_STORAGE_KEYS.USER_ID),
            pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL),
            clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
            registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
            hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
            hotelIds: parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS)),
            selectedHotelId: getStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID) || null,
            userHotels: parseUserHotelsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.USER_HOTELS)),
            topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
          }));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout]);

  // === LOGIN (memoized) ===
  const login = useCallback(async (authData) => {
    try {
      console.log("🔑 Processing login with cookie-based authentication...");

      // Validate required fields for cookie-based auth (no token required)
      if (!authData.userid || !authData.email) {
        throw new Error("Missing required authentication data: userid and email are required");
      }

      // Handle roles - convert to array if it's a single role or already an array
      const roles = Array.isArray(authData.roles) ? authData.roles : 
                   Array.isArray(authData.role) ? authData.role :
                   authData.roles ? [authData.roles] :
                   authData.role ? [authData.role] : [];

      // Determine initial active role
      const initialActiveRole = authData.activeRole || 
                               (roles.includes('HOTEL_ADMIN') ? 'HOTEL_ADMIN' :
                                roles.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' :
                                roles.includes('STAFF') ? 'STAFF' :
                                roles.includes('GUEST') ? 'GUEST' :
                                roles[0] || null);

      // Store auth data using Safari-specific utilities (no token needed for cookie-based auth)
      setStorageItem(AUTH_STORAGE_KEYS.USER_ID, authData.userid);
      setStorageItem(AUTH_STORAGE_KEYS.EMAIL, authData.email);
      setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(roles));
      setStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE, initialActiveRole);
      setStorageItem(AUTH_STORAGE_KEYS.USER_NAME, authData.userName || "");
      setStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL, authData.pictureURL || "");
      setStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG, Boolean(authData.flag).toString());
      setStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET, Boolean(authData.detailSet).toString());
      setStorageItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now().toString());
      
      // Handle hotelIds array from authData
      if (authData.hotelIds && Array.isArray(authData.hotelIds)) {
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS, stringifyHotelIdsForStorage(authData.hotelIds));
        // Set the first hotelId as the primary hotelId for backward compatibility
        if (authData.hotelIds.length > 0) {
          setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, authData.hotelIds[0]);
        }
      } else if (authData.hotelId) {
        // Fallback to single hotelId if hotelIds array is not provided
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, authData.hotelId);
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS, stringifyHotelIdsForStorage([authData.hotelId]));
      }

      const existingHotelId = getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID);
      const existingHotelIds = parseHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.HOTEL_IDS));

      const newAuthState = {
        isAuthenticated: true,
        email: authData.email,
        userId: authData.userid,
        userName: authData.userName || "",
        roles: roles,
        activeRole: initialActiveRole,
        pictureURL: authData.pictureURL || "",
        registerFlag: Boolean(authData.flag),
        clientDetailSet: Boolean(authData.detailSet),
        flag: true,
        hotelId: authData.hotelIds && authData.hotelIds.length > 0 ? authData.hotelIds[0] : (authData.hotelId || existingHotelId || null),
        hotelIds: authData.hotelIds && Array.isArray(authData.hotelIds) ? authData.hotelIds : (authData.hotelId ? [authData.hotelId] : existingHotelIds),
        topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)),
        isValidatingAuth: false, // Auth is validated since we just logged in
      };

      setAuthState(newAuthState);

      // Fetch subscription data if user has userId
      if (newAuthState.userId) {
        try {
          await fetchSubscriptionData(newAuthState.userId);
        } catch (subscriptionError) {
          console.warn("⚠️ Failed to fetch subscription data during login:", subscriptionError);
          // Don't fail login if subscription fetch fails
        }
      }

      // Navigate only if not a first-time registration
      if (!authData.flag) {
        // Check if there's a stored redirect URL
        const redirectUrl = getStorageItem(AUTH_STORAGE_KEYS.REDIRECT_URL);
        if (redirectUrl) {
          // Clear the redirect URL after using it
          removeStorageItem(AUTH_STORAGE_KEYS.REDIRECT_URL);
          navigate(redirectUrl);
        } else {
          navigate("/");
        }
      }

      const now = new Date();
      setLastLogin(now);
      setStorageItem("lastLogin", now.toISOString());

    } catch (error) {
      console.error("Failed to login", error);
      throw error; // Re-throw to allow handling in the calling component
    }
  }, [navigate]);

  // === SET HOTEL ID (memoized) ===
  const setHotelId = useCallback((hotelId) => {
    try {
      const hotelIdString = hotelId?.toString() || null;
      setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, hotelIdString);
      setAuthState(prev => ({
        ...prev,
        hotelId: hotelIdString,
      }));
    } catch (error) {
      console.error("Failed to set hotelId", error);
    }
  }, []);

  // === SET SELECTED HOTEL ID (memoized) ===
  const setSelectedHotelId = useCallback((hotelId) => {
    try {
      const hotelIdString = hotelId?.toString() || null;
      setStorageItem(AUTH_STORAGE_KEYS.SELECTED_HOTEL_ID, hotelIdString);
      setAuthState(prev => ({
        ...prev,
        selectedHotelId: hotelIdString,
      }));
    } catch (error) {
      console.error("Failed to set selected hotel ID", error);
    }
  }, []);

  // === GET SELECTED HOTEL (memoized) ===
  const getSelectedHotel = useCallback(() => {
    const selectedHotelId = authState.selectedHotelId;
    if (!selectedHotelId || !authState.userHotels || !Array.isArray(authState.userHotels)) {
      return null;
    }
    return authState.userHotels.find(hotel => hotel.id?.toString() === selectedHotelId) || null;
  }, [authState.selectedHotelId, authState.userHotels]);

  // === SET REDIRECT URL (memoized) ===
  const setRedirectUrl = useCallback((url) => {
    try {
      if (url) {
        setStorageItem(AUTH_STORAGE_KEYS.REDIRECT_URL, url);
      } else {
        removeStorageItem(AUTH_STORAGE_KEYS.REDIRECT_URL);
      }
    } catch (error) {
      console.error("Failed to set redirect URL", error);
    }
  }, []);

  // === SET ROLES (memoized) ===
  const setRoles = useCallback((roles) => {
    try {
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(rolesArray));
      setAuthState(prev => ({
        ...prev,
        roles: rolesArray,
      }));
    } catch (error) {
      console.error("Failed to set roles", error);
    }
  }, []);

  // === ADD ROLE (memoized) ===
  const addRole = useCallback((role) => {
    try {
      setAuthState(prev => {
        const newRoles = [...prev.roles];
        if (!newRoles.includes(role)) {
          newRoles.push(role);
          setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(newRoles));
        }
        return { ...prev, roles: newRoles };
      });
    } catch (error) {
      console.error("Failed to add role", error);
    }
  }, []);

  // === REMOVE ROLE (memoized) ===
  const removeRole = useCallback((role) => {
    try {
      setAuthState(prev => {
        const newRoles = prev.roles.filter(r => r !== role);
        setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(newRoles));
        return { ...prev, roles: newRoles };
      });
    } catch (error) {
      console.error("Failed to remove role", error);
    }
  }, []);

  // === GET PRIMARY ROLE (memoized) ===
  const getPrimaryRole = useCallback(() => {
    const roles = authState.roles;
    if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
    if (roles.includes('HOTEL_ADMIN')) return 'HOTEL_ADMIN';
    if (roles.includes('STAFF')) return 'STAFF';
    if (roles.includes('GUEST')) return 'GUEST';
    return roles[0] || null;
  }, [authState.roles]);

  // === SET ACTIVE ROLE (memoized) ===
  const setActiveRole = useCallback((role) => {
    try {
      // Validate that the role exists in user's roles
      if (!authState.roles.includes(role)) {
        console.error(`Role ${role} not found in user's roles:`, authState.roles);
        return;
      }
      
      setStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE, role);
      setAuthState(prev => ({
        ...prev,
        activeRole: role,
      }));
    } catch (error) {
      console.error("Failed to set active role", error);
    }
  }, [authState.roles]);

  // === GET CURRENT ACTIVE ROLE (memoized) ===
  const getCurrentActiveRole = useCallback(() => {
    // If no active role is set, use the primary role
    if (!authState.activeRole) {
      const primaryRole = getPrimaryRole();
      if (primaryRole) {
        setActiveRole(primaryRole);
        return primaryRole;
      }
      return null;
    }
    return authState.activeRole;
  }, [authState.activeRole, getPrimaryRole, setActiveRole]);

  // === SWITCH TO ROLE (memoized) ===
  const switchToRole = useCallback((role) => {
    if (authState.roles.includes(role)) {
      setActiveRole(role);
      return true;
    }
    return false;
  }, [authState.roles, setActiveRole]);

  // === BACKWARD COMPATIBILITY: Get primary role as 'role' ===
  const role = getCurrentActiveRole();

  // === UPDATE USER PROFILE (new method) ===
  const updateUserProfile = useCallback((updates) => {
    try {
      const allowedUpdates = ['userName', 'pictureURL', 'clientDetailSet'];
      
      Object.entries(updates).forEach(([key, value]) => {
        if (allowedUpdates.includes(key)) {
          const storageKey = key === 'userName' ? AUTH_STORAGE_KEYS.USER_NAME :
                            key === 'pictureURL' ? AUTH_STORAGE_KEYS.PICTURE_URL :
                            AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET;
          
          setStorageItem(storageKey, value);
        }
      });

      setAuthState(prev => ({
        ...prev,
        ...updates
      }));
    } catch (error) {
      console.error("Failed to update user profile", error);
    }
  }, []);

  // === SET TOP HOTEL IDS (memoized) ===
  const setTopHotelIds = useCallback((hotelIds) => {
    try {
      const hotelIdsArray = Array.isArray(hotelIds) ? hotelIds : [hotelIds];
      setStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS, stringifyTopHotelIdsForStorage(hotelIdsArray));
      setAuthState(prev => ({
        ...prev,
        topHotelIds: hotelIdsArray,
      }));
    } catch (error) {
      console.error("Failed to set top hotel IDs", error);
    }
  }, []);

  // === ADD TOP HOTEL ID (memoized) ===
  const addTopHotelId = useCallback((hotelId) => {
    try {
      setAuthState(prev => {
        const newTopHotelIds = [...prev.topHotelIds];
        if (!newTopHotelIds.includes(hotelId)) {
          newTopHotelIds.push(hotelId);
          // Keep only top 3
          if (newTopHotelIds.length > 3) {
            newTopHotelIds.shift();
          }
          setStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS, stringifyTopHotelIdsForStorage(newTopHotelIds));
        }
        return { ...prev, topHotelIds: newTopHotelIds };
      });
    } catch (error) {
      console.error("Failed to add top hotel ID", error);
    }
  }, []);

  // === REMOVE TOP HOTEL ID (memoized) ===
  const removeTopHotelId = useCallback((hotelId) => {
    try {
      setAuthState(prev => {
        const newTopHotelIds = prev.topHotelIds.filter(id => id !== hotelId);
        setStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS, stringifyTopHotelIdsForStorage(newTopHotelIds));
        return { ...prev, topHotelIds: newTopHotelIds };
      });
    } catch (error) {
      console.error("Failed to remove top hotel ID", error);
    }
  }, []);

  // === CHECK ROLE (memoized) ===
  const hasRole = useCallback((roleToCheck) => {
    return authState.roles.includes(roleToCheck);
  }, [authState.roles]);

  // === CHECK ANY ROLE (memoized) ===
  const hasAnyRole = useCallback((rolesToCheck) => {
    return rolesToCheck.some(role => authState.roles.includes(role));
  }, [authState.roles]);

  // === CHECK ALL ROLES (memoized) ===
  const hasAllRoles = useCallback((rolesToCheck) => {
    return rolesToCheck.every(role => authState.roles.includes(role));
  }, [authState.roles]);

  // === CHECK IF HOTEL IS TOP HOTEL (memoized) ===
  const isTopHotel = useCallback((hotelIdToCheck) => {
    if (!hotelIdToCheck || !authState.topHotelIds || !Array.isArray(authState.topHotelIds)) {
      return false;
    }
    return authState.topHotelIds.includes(hotelIdToCheck.toString());
  }, [authState.topHotelIds]);

  // === CHECK IF USER HAS ACCESS TO HOTEL (memoized) ===
  const hasHotelAccess = useCallback((hotelIdToCheck) => {
    if (!hotelIdToCheck || !authState.hotelIds || !Array.isArray(authState.hotelIds)) {
      return false;
    }
    return authState.hotelIds.includes(hotelIdToCheck.toString());
  }, [authState.hotelIds]);

  // === GET PRIMARY HOTEL ID (memoized) ===
  const getPrimaryHotelId = useCallback(() => {
    if (authState.hotelIds && authState.hotelIds.length > 0) {
      return authState.hotelIds[0];
    }
    return authState.hotelId || null;
  }, [authState.hotelIds, authState.hotelId]);

  // === MEMOIZED CONTEXT VALUE ===
  const contextValue = useMemo(() => ({
    // State
    isAuthenticated: authState.isAuthenticated,
    email: authState.email,
    userId: authState.userId,
    userName: authState.userName,
    roles: authState.roles,
    activeRole: authState.activeRole,
    role, // Backward compatibility
    pictureURL: authState.pictureURL,
    registerFlag: authState.registerFlag,
    clientDetailSet: authState.clientDetailSet,
    flag: authState.flag,
    hotelId: authState.hotelId,
    hotelIds: authState.hotelIds,
    selectedHotelId: authState.selectedHotelId,
    userHotels: authState.userHotels,
    topHotelIds: authState.topHotelIds,
    isValidatingAuth: authState.isValidatingAuth,
    subscriptionPaymentStatus: authState.subscriptionPaymentStatus,
    subscriptionPlan: authState.subscriptionPlan,
    subscriptionIsActive: authState.subscriptionIsActive,
    subscriptionNextBillingDate: authState.subscriptionNextBillingDate,
    subscriptionExpirationNotification: authState.subscriptionExpirationNotification,
    lastLogin,

    // Actions
    login,
    logout,
    setHotelId,
    setSelectedHotelId,
    getSelectedHotel,
    fetchUserHotels,
    setRedirectUrl,
    setRoles,
    addRole,
    removeRole,
    setActiveRole,
    getCurrentActiveRole,
    switchToRole,
    updateUserProfile,
    setTopHotelIds,
    addTopHotelId,
    removeTopHotelId,
    fetchSubscriptionData,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isTopHotel,
    hasHotelAccess,
    getPrimaryHotelId,
  }), [
    authState,
    lastLogin,
    login,
    logout,
    setHotelId,
    setSelectedHotelId,
    getSelectedHotel,
    fetchUserHotels,
    setRedirectUrl,
    setRoles,
    addRole,
    removeRole,
    setActiveRole,
    getCurrentActiveRole,
    switchToRole,
    updateUserProfile,
    setTopHotelIds,
    addTopHotelId,
    removeTopHotelId,
    fetchSubscriptionData,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isTopHotel,
    hasHotelAccess,
    getPrimaryHotelId,
  ]);

  console.log("🔧 AuthProvider context value created, rendering provider...");

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider. Make sure the component is wrapped in <AuthProvider>");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};