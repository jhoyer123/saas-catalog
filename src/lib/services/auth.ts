import { createClient } from "@/lib/supabase/supabaseClient";
import { AuthResponse } from "@supabase/supabase-js";

//types
import type { LoginDataInput, RegisterDataInput } from "@/types/auth.types";
//helpers
import { getSupabaseErrorMessage } from "../helpers/supabase-errors";

const supabase = createClient();

/**
 * Function to sign up a new user using Supabase authentication
 */
export const signUpNewUser = async (
  dataRegister: RegisterDataInput,
): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({
    email: dataRegister.email,
    password: dataRegister.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: dataRegister.full_name,
        phone: dataRegister.phone,
      },
    },
  });
  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
  return { data, error: null };
};

/**
 * Function to sign in a user using Supabase authentication
 */
export const signInUser = async (
  dataLogin: LoginDataInput,
): Promise<AuthResponse> => {
  // 👇 Limpia cualquier sesión corrupta antes de intentar login
  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dataLogin.email,
    password: dataLogin.password,
  });

  if (error) {
    console.error("Error signing in user:", error);
    throw new Error(getSupabaseErrorMessage(error));
  }

  return { data, error: null };
};

/**
 * Function to sign out the current user using Supabase authentication
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
};

// Obtener sesión actual
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
};
