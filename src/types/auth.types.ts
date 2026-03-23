/**
 * Types for register
 */
export interface RegisterDataInput {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Types for login
 */
export interface LoginDataInput {
  email: string;
  password: string;
}

/**
 * Types for user
 */
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  is_active: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}
