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
