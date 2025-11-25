import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "../services/authApi";

const AuthContext = createContext(null);
const STORAGE_KEY = "authUser";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // User inladen uit localStorage bij opstart
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
      const res = await loginRequest({
        email: email.trim(),
        password,
      });

      console.log("Login response from API:", res.data);

      const apiData = res.data ?? {};

      // Als backend ApiResponse gebruikt: { success, message, data }
      let userData;
      if (apiData && typeof apiData === "object" && "data" in apiData) {
        if (apiData.success === false) {
          // backend geeft zelf aan dat het fout is
          throw new Error(apiData.message || "Login failed");
        }
        userData = apiData.data;
      } else {
        // fallback: misschien stuurt backend direct een user terug
        userData = apiData;
      }

      if (!userData || !userData.id) {
        // response vorm klopt niet – maar geen credentials fout
        throw new Error(
          apiData.message || "Login response is invalid or missing user."
        );
      }

      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error("Login error:", err);

      // Als het een HTTP error is (401/400/etc)
      if (err.response?.data) {
        const apiErr = err.response.data;
        const msg = apiErr.error || apiErr.message || "Invalid login credentials.";
        throw new Error(msg);
      }

      // Als het een zelf gegooide Error is (bijv. response vorm fout)
      if (err.message) {
        throw err;
      }

      // Fallback
      throw new Error("Invalid login credentials.");
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
