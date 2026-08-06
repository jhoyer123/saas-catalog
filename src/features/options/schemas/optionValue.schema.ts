/* import { z } from "zod";

export const optionValueSchema = (
  inputType: "text" | "number" | "color" | "image",
) =>
  z
    .object({
      value: z
        .string()
        .trim()
        .max(255, "Máximo 255 caracteres")
        .optional()
        .nullable(),

      color_hexes: z
        .array(
          z.string().regex(/^#[0-9A-F]{6}$/i, {
            message: "Cada color debe ser un HEX válido",
          }),
        )
        .max(5, "Máximo 5 colores")
        .optional()
        .nullable(),

      image_url: z.string().optional().nullable(),

      numeric_value: z.number().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      switch (inputType) {
        case "text":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El valor es requerido.",
            });
          }
          break;

        case "number":
          if (data.numeric_value == null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["numeric_value"],
              message: "El valor numérico es requerido.",
            });
          }
          break;

        case "color":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El nombre del color es requerido.",
            });
          }

          if (!data.color_hexes || data.color_hexes.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["color_hexes"],
              message: "Debe seleccionar al menos un color.",
            });
          }
          break;

        case "image":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El nombre es requerido.",
            });
          }

          if (!data.image_url) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["image_url"],
              message: "La imagen es requerida.",
            });
          }
          break;
      }
    });

export type OptionValueForm = z.infer<ReturnType<typeof optionValueSchema>>;
 */

// @/schemas/optionValue.schema.ts

import { z } from "zod";

export const optionValueSchema = (
  inputType: "text" | "number" | "color" | "image",
) =>
  z
    .object({
      value: z
        .string()
        .trim()
        .max(255, "Máximo 255 caracteres")
        .optional()
        .nullable(),

      color_hexes: z
        .array(
          z.string().regex(/^#[0-9A-F]{6}$/i, {
            message: "Cada color debe ser un HEX válido",
          }),
        )
        .max(5, "Máximo 5 colores")
        .optional()
        .nullable(),

      image_url: z.string().optional().nullable(),

      displayNumber: z.union([z.number(), z.nan()]).optional().nullable(),

      original_unit: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      switch (inputType) {
        case "text":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El valor es requerido.",
            });
          }
          break;

        case "number":
          if (data.displayNumber == null || Number.isNaN(data.displayNumber)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["displayNumber"],
              message: "El valor numérico es requerido.",
            });
          }
          break;

        case "color":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El nombre del color es requerido.",
            });
          }

          if (!data.color_hexes || data.color_hexes.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["color_hexes"],
              message: "Debe seleccionar al menos un color.",
            });
          }
          break;

        case "image":
          if (!data.value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["value"],
              message: "El nombre es requerido.",
            });
          }

          if (!data.image_url) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["image_url"],
              message: "La imagen es requerida.",
            });
          }
          break;
      }
    });

export type OptionValueForm = z.infer<ReturnType<typeof optionValueSchema>>;
