import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

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
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return defaultAuthState;
      }
      return {
        isAuthenticated: true,
        token: token,
        email: localStorage.getItem("email") || "",
        role: localStorage.getItem("role") || "",
        clientDetailSet: localStorage.getItem("clientDetailSet") === "true",
        userName: localStorage.getItem("userName") || "",
        registerFlag: localStorage.getItem("registerFlag") === "true",
        pictureURL: localStorage.getItem("pictureURL") || "",
        userId: localStorage.getItem("userId") || "",
      };
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      return defaultAuthState;
    }
  });

  // Single effect for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: Boolean(localStorage.getItem("token")),
        }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (authData) => {
    console.log("Loggin in ........");
    try {
      localStorage.setItem("token", authData.token);
      localStorage.setItem("userId", authData.userid);
      localStorage.setItem("email", authData.email);
      localStorage.setItem("role", authData.role || "");
      localStorage.setItem("userName", authData.userName || "");
      localStorage.setItem("pictureURL", authData.pictureURL || "");
      localStorage.setItem("registerFlag", Boolean(authData.flag).toString());
      localStorage.setItem(
        "clientDetailSet",
        Boolean(authData.detailSet).toString()
      );

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
      });

      navigate("/");
    } catch (error) {
      console.error("Failed to save auth data", error);
    }
  };

  const logout = () => {
    try {
      console.log("Loggin out .....");
      localStorage.clear();
      setAuthState(defaultAuthState);
    } catch (error) {
      console.error("Failed to clear auth data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
