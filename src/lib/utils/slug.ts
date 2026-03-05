// src/lib/utils/slug.ts
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};
