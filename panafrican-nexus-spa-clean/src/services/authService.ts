import { http } from "./http";
import { tokenStorage } from "./tokenStorage";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
} from "../types/auth";

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/login", payload);
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/register", payload);
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data;
  },

  async me(): Promise<UserDto> {
    const { data } = await http.get<UserDto>("/auth/me");
    return data;
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccess();
  },
};
