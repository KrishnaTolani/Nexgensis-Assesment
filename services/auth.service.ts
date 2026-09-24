import axiosInstance from "@/lib/axios";
import { LoginRequest, LoginResponse } from "@/types/auth.types";

class AuthService {
  // POST /auth/login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  }

  // Save token and user to localStorage
  saveAuth(data: LoginResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("auth_user", JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
      }));
    }
  }

  // Remove token and user from localStorage
  clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }

  // Get stored token
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  // Get stored user
  getUser(): any | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("auth_user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
