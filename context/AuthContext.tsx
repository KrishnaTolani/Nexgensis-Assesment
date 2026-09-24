"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginRequest } from "@/types/auth.types";
import authService from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, check if user is already logged in
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      
      // Save to localStorage
      authService.saveAuth(response);
      
      // Update state
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
      });

      // Redirect to products page
      router.push("/products");
    } catch (error: any) {
      // Let the component handle the error
      throw error;
    }
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
