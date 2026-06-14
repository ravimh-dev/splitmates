import React, { createContext, useState, useEffect, useContext } from "react";
import { getProfile, loginUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("splitmate_token"));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("splitmate_token");
      if (storedToken) {
        try {
          setToken(storedToken);
          const profile = await getProfile();
          setUser(profile);
        } catch (err) {
          console.error("Failed to restore auth session:", err);
          // Token is invalid/expired
          localStorage.removeItem("splitmate_token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("splitmate_token", data.token);
      setToken(data.token);
      
      // Fetch user profile
      const profile = await getProfile();
      setUser(profile);
      setIsLoading(false);
      return profile;
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("splitmate_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      return data.user;
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.message || "Registration failed. Try a different email.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem("splitmate_token");
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfileState,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
