export type UserRole = 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
}

export interface AuthResponse {
  /** Backend may send a number (JSON) for DB ids — always normalize to string in the client. */
  id: string | number;
  email: string;
  role: string | string[];
  name?: string;
}
