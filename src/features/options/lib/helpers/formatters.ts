export const isValidHexColor = (value: string) => /^#[0-9A-F]{6}$/.test(value);

export const normalizeColorHex = (value: string) => {
  const normalized = value.trim().toUpperCase();
  return normalized.startsWith("#") ? normalized : `#${normalized}`;
};

export const normalizeColorHexes = (colorHexes: string[]) =>
  Array.from(
    new Set(
      colorHexes.map(normalizeColorHex).filter((hex) => isValidHexColor(hex)),
    ),
  ).sort();

/**
 * Normalización básica para textos.
 * - Elimina espacios repetidos.
 * - Quita espacios al inicio y final.
 * - Conserva mayúsculas/minúsculas originales.
 */
export const normalizeText = (value: string): string => {
  if (!value) return "";

  return value.replace(/\s+/g, " ").trim();
};

/**
 * Normalización para colores.
 * - Limpia espacios.
 * - Convierte a Title Case.
 *
 * Ej:
 * "rojo intenso" -> "Rojo Intenso"
 * "ROJO" -> "Rojo"
 */
export const normalizeTitleCase = (value: string): string => {
  if (!value) return "";

  return value
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
