import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// === Constants ===
const AUTH_STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  EMAIL: 'email',
  ROLE: 'role',
  USER_NAME: 'userName',
  PICTURE_URL: 'pictureURL',
  REGISTER_FLAG: 'registerFlag',
  CLIENT_DETAIL_SET: 'clientDetailSet',
  HOTEL_ID: 'hotelId'
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

// === Utility to safely get from localStorage ===
const getStorageItem = (key, defaultValue = '') => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage`, error);
    return defaultValue;
  }
};

// === Utility to safely set to localStorage ===
const setStorageItem = (key, value) => {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch (error) {
    console.error(`Failed to set ${key} in localStorage`, error);
  }
};

// === Context Setup ===
const AuthContext = createContext(null);

const defaultAuthState = {
  isAuthenticated: false,
  token: null,
  email: "",
  role: "",
  clientDetailSet: false,
  userName: "",
  registerFlag: false,
  pictureURL: "",
  userId: "",
  flag: false,
  hotelId: null,
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  const [authState, setAuthState] = useState(() => {
    try {
      const token = getStorageItem(AUTH_STORAGE_KEYS.TOKEN);
      
      if (!token || isTokenExpired(token)) {
        localStorage.clear();
        return defaultAuthState;
      }

      return {
        isAuthenticated: true,
        token,
        email: getStorageItem(AUTH_STORAGE_KEYS.EMAIL),
        role: getStorageItem(AUTH_STORAGE_KEYS.ROLE),
        clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
        userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME),
        registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
        pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL),
        userId: getStorageItem(AUTH_STORAGE_KEYS.USER_ID),
        flag: false,
        hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
      };
    } catch (error) {
      console.error("Failed to initialize auth state", error);
      return defaultAuthState;
    }
  });

  // === LOGOUT (memoized) ===
  const logout = useCallback(() => {
    try {
      console.log("Logging out...");
      localStorage.clear();
      setAuthState(defaultAuthState);
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
            role: getStorageItem(AUTH_STORAGE_KEYS.ROLE),
            userName: getStorageItem(AUTH_STORAGE_KEYS.USER_NAME),
            userId: getStorageItem(AUTH_STORAGE_KEYS.USER_ID),
            pictureURL: getStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL),
            clientDetailSet: getStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET) === "true",
            registerFlag: getStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG) === "true",
            hotelId: getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID) || null,
          }));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [logout]);

  // === LOGIN (memoized) ===
  const login = useCallback((authData) => {
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

      // Store auth data
      setStorageItem(AUTH_STORAGE_KEYS.TOKEN, authData.token);
      setStorageItem(AUTH_STORAGE_KEYS.USER_ID, authData.userid);
      setStorageItem(AUTH_STORAGE_KEYS.EMAIL, authData.email);
      setStorageItem(AUTH_STORAGE_KEYS.ROLE, authData.role || "");
      setStorageItem(AUTH_STORAGE_KEYS.USER_NAME, authData.userName || "");
      setStorageItem(AUTH_STORAGE_KEYS.PICTURE_URL, authData.pictureURL || "");
      setStorageItem(AUTH_STORAGE_KEYS.REGISTER_FLAG, Boolean(authData.flag).toString());
      setStorageItem(AUTH_STORAGE_KEYS.CLIENT_DETAIL_SET, Boolean(authData.detailSet).toString());
      
      // Preserve existing hotelId if not provided in authData
      if (authData.hotelId) {
        setStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID, authData.hotelId);
      }

      const existingHotelId = getStorageItem(AUTH_STORAGE_KEYS.HOTEL_ID);

      setAuthState({
        isAuthenticated: true,
        token: authData.token,
        email: authData.email,
        userId: authData.userid,
        userName: authData.userName || "",
        role: authData.role || "",
        pictureURL: authData.pictureURL || "",
        registerFlag: Boolean(authData.flag),
        clientDetailSet: Boolean(authData.detailSet),
        flag: true,
        hotelId: authData.hotelId || existingHotelId || null,
      });

      // Navigate only if not a first-time registration
      if (!authData.flag) {
        navigate("/");
      }
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

  // === SET ROLE (memoized) ===
  const setRole = useCallback((role) => {
    try {
      setStorageItem(AUTH_STORAGE_KEYS.ROLE, role);
      setAuthState(prev => ({
        ...prev,
        role,
      }));
    } catch (error) {
      console.error("Failed to set role", error);
    }
  }, []);

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

  // === Memoize context value to prevent unnecessary re-renders ===
  const contextValue = useMemo(() => ({
    ...authState,
    login,
    logout,
    setHotelId,
    setRole,
    updateUserProfile,
  }), [authState, login, logout, setHotelId, setRole, updateUserProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// === Custom hook with error handling ===
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};