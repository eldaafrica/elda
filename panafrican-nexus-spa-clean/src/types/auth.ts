// DTOs liés à l'authentification et JWT

export type Role = "ADMIN" | "EDITEUR" | "LECTEUR" | "USER";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;   // "Bearer"
  expiresIn?: number;   // secondes
}

export interface UserDto {
  id: string;
  email: string;
  name?: string;
  roles: Role[];
  enabled?: boolean;
  createdAt?: string;
}
