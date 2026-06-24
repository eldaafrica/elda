// src/types/user.ts

export type Role =
  | "ADMIN"
  | "EDITEUR"
  | "LECTEUR";

export interface User {
  id: string;

  name: string;

  email: string;

  country?: string;

  countryCode?: string;

  roles: Role[];

  enabled: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface InviteUserRequest {
  name: string;

  email: string;

  country?: string;

  countryCode?: string;

  roles: Role[];

  tempPassword: string;
}

export interface UpdateUserRequest {
  name: string;

  country?: string;

  countryCode?: string;
}

export interface UpdateUserRolesRequest {
  roles: Role[];
}