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

// === Constants ===
const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  EMAIL: 'email',
  ROLES: 'roles', 
  ACTIVE_ROLE: 'activeRole', // New key for active role
  USER_NAME: 'userName',
  PICTURE_URL: 'pictureURL',
  REGISTER_FLAG: 'registerFlag',
  CLIENT_DETAIL_SET: 'clientDetailSet',
  HOTEL_ID: 'hotelId',
  TOP_HOTEL_IDS: 'topHotelIds' // New key for persistent top hotel IDs
};

// === Utility to check token expiry ===
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return now >= payload.exp;
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return true; // fallback to expired
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
  token: null,
  email: "",
  roles: [], // Changed from role to roles array
  activeRole: null, // New active role state
  clientDetailSet: false,
  userName: "",
  registerFlag: false,
  pictureURL: "",
  userId: "",
  flag: false,
  hotelId: null,
  topHotelIds: [], // Store top three hotel IDs
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize auth state from localStorage with Safari-specific handling
  const [authState, setAuthState] = useState(() => {
    try {
      const token = getStorageItem(AUTH_STORAGE_KEYS.TOKEN);
      
      if (!token || isTokenExpired(token)) {
        clearAuthData();
        return defaultAuthState;
      }

      const authData = {
        isAuthenticated: true,
        token,
        email: getStorageItem(AUTH_STORAGE_KEYS.EMAIL),
        roles: parseRolesFromStorage(getStorageItem(AUTH_STORAGE_KEYS.ROLES)), // Parse roles array
        activeRole: getStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE), // Set active role
        clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
        userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME),
        registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
        pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL),
        userId: getStorageItem(AUTH_STORAGE_KEYS.USER_ID),
        flag: false,
        hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
        topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)), // Load from localStorage
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

  // === LOGOUT (memoized) ===
  const logout = useCallback(() => {
    try {
      console.log("Logging out...");
      
      // Preserve top hotel IDs during logout
      const topHotelIds = getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS);
      console.log("🔒 [LOGOUT] Preserving top hotel IDs:", topHotelIds);
      
      clearAuthData();
      
      // Restore top hotel IDs after clearing
      if (topHotelIds) {
        setStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS, topHotelIds);
        console.log("🔒 [LOGOUT] Restored top hotel IDs to localStorage");
      }
      
      setAuthState({
        ...defaultAuthState,
        topHotelIds: parseTopHotelIdsFromStorage(topHotelIds) // Preserve in state too
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to clear auth data", error);
    }
  }, [navigate]);

  // === Auto-check token expiry ===
  useEffect(() => {
    if (authState.token && isTokenExpired(authState.token)) {
      console.warn("Token expired. Logging out...");
      logout();
    }
  }, [authState.token, logout]);

  // === Listen to storage changes (cross-tab sync) ===
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STORAGE_KEYS.TOKEN) {
        const token = e.newValue;
        
        if (!token || isTokenExpired(token)) {
          logout();
        } else {
          // Sync auth state with other tabs
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            token,
            email: getStorageItem(AUTH_STORAGE_KEYS.EMAIL),
            roles: parseRolesFromStorage(getStorageItem(AUTH_STORAGE_KEYS.ROLES)), // Parse roles array
            activeRole: getStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE), // Sync active role
            userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME),
            userId: getStorageItem(AUTH_STORAGE_KEYS.USER_ID),
            pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL),
            clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
            registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
            hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
            topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)), // Sync from localStorage
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
      console.log("Logging in...");

      // Validate required fields
      if (!authData.token || !authData.userid || !authData.email) {
        throw new Error("Missing required authentication data");
      }

      // Check if token is already expired
      if (isTokenExpired(authData.token)) {
        throw new Error("Token is already expired");
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

      // Store auth data using Safari-specific utilities
      setStorageItem(AUTH_STORAGE_KEYS.TOKEN, authData.token);
      setStorageItem(AUTH_STORAGE_KEYS.USER_ID, authData.userid);
      setStorageItem(AUTH_STORAGE_KEYS.EMAIL, authData.email);
      setStorageItem(AUTH_STORAGE_KEYS.ROLES, stringifyRolesForStorage(roles)); // Store roles array
      setStorageItem(AUTH_STORAGE_KEYS.ACTIVE_ROLE, initialActiveRole); // Store initial active role
      setStorageItem(AUTH_STORAGE_KEYS.USER_NAME, authData.userName || "");
      setStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL, authData.pictureURL || "");
      setStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG, Boolean(authData.flag).toString());
      setStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET, Boolean(authData.detailSet).toString());
      
      // Preserve existing hotelId if not provided in authData
      if (authData.hotelId) {
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, authData.hotelId);
      }

      const existingHotelId = getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID);

      const newAuthState = {
        isAuthenticated: true,
        token: authData.token,
        email: authData.email,
        userId: authData.userid,
        userName: authData.userName || "",
        roles: roles, // Store roles array
        activeRole: initialActiveRole, // Store initial active role
        pictureURL: authData.pictureURL || "",
        registerFlag: Boolean(authData.flag),
        clientDetailSet: Boolean(authData.detailSet),
        flag: true,
        hotelId: authData.hotelId || existingHotelId || null,
        topHotelIds: parseTopHotelIdsFromStorage(getStorageItem(AUTH_STORAGE_KEYS.TOP_HOTEL_IDS)), // Preserve existing top hotel IDs on login
      };

      setAuthState(newAuthState);

      // Navigate only if not a first-time registration
      if (!authData.flag) {
        navigate("/");
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

  // === MEMOIZED CONTEXT VALUE ===
  const contextValue = useMemo(() => ({
    // State
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
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
    topHotelIds: authState.topHotelIds,
    lastLogin,

    // Actions
    login,
    logout,
    setHotelId,
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

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isTopHotel,
  }), [
    authState,
    lastLogin,
    login,
    logout,
    setHotelId,
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
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isTopHotel,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};