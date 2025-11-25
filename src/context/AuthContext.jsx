import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "../services/authApi";

const AuthContext = createContext(null);
const STORAGE_KEY = "authUser";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Bij opstart: user inladen uit localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error("Failed to parse stored auth user", e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setInitializing(false);
    }
  }, []);

  const isAuthenticated = !!user;

  async function login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    try {
      const res = await loginRequest({ email, password });

      const apiData = res.data;
      const userData = apiData?.data ?? apiData;

      if (!userData) {
        throw new Error(apiData?.message || "Unknown error: no user received.");
      }

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      return userData;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid login credentials.";
      throw new Error(message);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    user,
    isAuthenticated,
    initializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
