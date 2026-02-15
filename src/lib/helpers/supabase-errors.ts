// lib/helpers/supabase-errors.ts

const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  "Invalid login credentials": "Correo o contraseña incorrectos",
  "Email not confirmed":
    "Debes verificar tu correo electrónico. Revisa tu bandeja de entrada.",
  "User already registered": "Este correo ya está registrado",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres",
  "User not found": "Usuario no encontrado",
  "Signup requires a valid password": "La contraseña no es válida",
  "Invalid email": "Correo electrónico no válido",

  // Database errors
  "duplicate key value violates unique constraint": "Este registro ya existe",
  "permission denied": "No tienes permisos para realizar esta acción",
};

export const getSupabaseErrorMessage = (error: Error | string): string => {
  const errorMessage = typeof error === "string" ? error : error.message;

  // Buscar coincidencia exacta
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }

  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Mensaje por defecto
  return "Ha ocurrido un error. Por favor, intenta de nuevo.";
};
