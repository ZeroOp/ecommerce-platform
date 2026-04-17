export type UserRole = 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
}

export interface AuthResponse {
  id: string;
  email: string;
  role: string | string[];
  name?: string;
}
