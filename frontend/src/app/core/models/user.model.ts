export interface User {
  email: string;
  fullName: string;
  roles: string[];
  avatarUrl?: string;
}

export interface Profile {
  id: number;
  name: string;
  avatarUrl?: string;
  isKids: boolean;
  language: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
