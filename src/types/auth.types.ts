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
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}