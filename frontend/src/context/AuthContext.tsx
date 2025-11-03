import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient, setAuthToken } from "../api";

type Role = {
  role_name: "admin" | "editor" | "viewer" | string;
  can_create_asset: boolean;
  can_read_asset: boolean;
  can_update_asset: boolean;
  can_delete_asset: boolean;
  can_manage_users: boolean;
};

type User = {
  id: number;
  username: string;
  display_name?: string;
  dept?: string;
  is_active: boolean;
  role: Role;
};

type AuthContextState = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  useEffect(() => {
    setAuthToken(token);
    if (token && !user) {
      refreshProfile();
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await apiClient.post("/api/login", { username, password });
    const { token: tokenPayload, user: userPayload } = response.data;
    setToken(tokenPayload.access_token);
    localStorage.setItem("token", tokenPayload.access_token);
    setUser(userPayload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await apiClient.get("/api/me");
      setUser(response.data);
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
};
