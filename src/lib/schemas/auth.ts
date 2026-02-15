import z, { string } from "zod";
/**
 * Schema validador for login singnup forms
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "Este campo es requerido" })
    .email("Correo electrónico no válido"),
  password: z
    .string({ message: "Este campo es requerido" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginData = z.infer<typeof loginSchema>;

/**
 * Schema validador for register singnup forms
 */
export const registerSchema = z
  .object({
    full_name: z
      .string({ message: "Este campo es requerido" })
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z
      .string({ message: "Este campo es requerido" })
      .email("Correo electrónico no válido"),
    phone: z
      .string({ message: "Este campo es requerido" })
      .regex(/^\d+$/, "El teléfono solo debe contener números")
      .length(8, "El número de teléfono debe tener exactamente 8 dígitos")
      .min(8, "El número de teléfono debe tener al menos 8 dígitos"),
    password: z
      .string({ message: "Este campo es requerido" })
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string({ message: "Este campo es requerido" })
      .min(6, "La confirmación de contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;
