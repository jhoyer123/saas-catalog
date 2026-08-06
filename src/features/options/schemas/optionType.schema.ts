import { z } from "zod";

export const optionTypeSchema = z.object({
  name: z
    .string({ message: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(255),
  input_type: z.enum(["text", "color", "image", "number"], {
    message: "Selecciona un tipo de entrada",
  }),
  is_visual_default: z.boolean(),
});

export type OptionTypeForm = z.infer<typeof optionTypeSchema>;
