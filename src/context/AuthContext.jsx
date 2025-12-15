import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest, logout as logoutRequest } from "../services/authApi";

const AuthContext = createContext(null);
const STORAGE_KEY = "authUser";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);


  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
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
  if (!email || !password) throw new Error("Email and password are required.");

  try {
    const res = await loginRequest({
      email: email.trim(),
      password,
    });

    const api = res.data ?? {};
    const success = api.success ?? true;
    const message = api.message;
    const received = api.data; 

    if (!success) {
      throw new Error(message || "Login failed");
    }

    if (!received || !received.user || !received.token) {
      throw new Error("Invalid login response: missing user or token.");
    }

    const user = received.user;
    const token = received.token;

    // save user
    setUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    // save token
    localStorage.setItem("authToken", token);

    return user;
  } catch (err) {
    console.error("Login error:", err);

    if (err.response?.data) {
      const resErr = err.response.data;
      throw new Error(resErr.error || resErr.message || "Login failed.");
    }

    throw new Error(err.message || "Login failed.");
  }
}

  async function logout() {
    try {
      if (user?.id) {
        await logoutRequest(user.id);
      }
    } catch (e) {
      console.warn("Logout API call failed (ignored):", e);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
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
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
