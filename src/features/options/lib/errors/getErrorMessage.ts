/**
 * Convierte cualquier error (específicamente adaptado para TanStack Query / Supabase)
 * en un mensaje apto para mostrar al usuario.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "Ocurrió un error inesperado.";
  }

  // 1. Si es un string directo
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  // TanStack Query suele envolver el error original en .cause o exponerlo directamente
  const err =
    typeof error === "object" && error !== null && "cause" in error
      ? (error as { cause: any }).cause
      : error;

  const code = (err as any)?.code || "";
  const message = (err as any)?.message || (error as Error)?.message || "";
  const details = (err as any)?.details || "";
  const constraint = (err as any)?.constraint || "";

  // 2. Verificar por constraint específico en el diccionario
  const CONSTRAINT_MESSAGES: Record<string, string> = {
    products_name_key: "Ya existe un producto con ese nombre.",
    products_sku_key: "Ya existe un producto con ese SKU.",

    // Products
    products_name_store_unique:
      "Ya existe un producto con ese nombre en esta tienda.",
    products_sku_store_unique:
      "Ya existe un producto con ese SKU en esta tienda.",
    products_slug_store_unique:
      "Ya existe un producto con ese slug en esta tienda.",
    products_brand_id_fkey: "La marca especificada no existe.",
    products_category_id_fkey: "La categoría especificada no existe.",
    products_store_id_fkey: "La tienda especificada no existe.",
    products_pkey: "El identificador del producto ya existe.",

    // Product variants
    product_variants_pkey: "El identificador de la variante ya existe.",
    product_variants_product_id_fkey: "El producto especificado no existe.",
    product_variants_product_id_option_signature_key:
      "Ya existe una variante con esa combinación de opciones para este producto.",
    product_variants_store_id_fkey: "La tienda especificada no existe.",
    product_variants_store_id_sku_key:
      "Ya existe una variante con ese SKU en esta tienda.",

    // Brands
    brands_pkey: "El identificador de la marca ya existe.",
    brands_store_id_fkey: "La tienda especificada no existe.",
    brands_store_slug_unique:
      "Ya existe una marca con ese identificador en esta tienda.",

    // Categories
    categories_name_key: "Ya existe una categoría con ese nombre.",

    // Store option types
    store_option_types_store_id_name_key:
      "Ya existe una opción con ese nombre en esta tienda.",
    store_option_types_input_type_check: "El tipo de entrada no es válido.",
    store_option_types_store_id_fkey: "La tienda especificada no existe.",
    store_option_types_pkey: "El identificador del tipo de opción ya existe.",

    // Store option values
    store_option_values_pkey: "El identificador del valor de opción ya existe.",
    store_option_values_option_type_id_fkey:
      "El tipo de opción especificado no existe.",
    store_option_values_color_hexes_is_array_check:
      "Los colores en formato hexadecimal deben tener una estructura válida.",
    store_option_values_type_color_hexes_key:
      "Ya existe un valor con esa combinación de colores para esta opción.",
    uq_store_option_values_option_type_value_ci:
      "Ya existe un valor con ese nombre para esta opción.",
  };

  if (constraint && CONSTRAINT_MESSAGES[constraint]) {
    return CONSTRAINT_MESSAGES[constraint];
  }

  const text = `${message} ${details}`;
  for (const key of Object.keys(CONSTRAINT_MESSAGES)) {
    if (text.includes(key)) {
      return CONSTRAINT_MESSAGES[key];
    }
  }

  // 3. Códigos comunes de PostgreSQL
  const POSTGRES_ERROR_MESSAGES: Record<string, string> = {
    "23502": "Faltan datos obligatorios.",
    "23503":
      "No se puede realizar la operación porque existen datos relacionados.",
    "23505": "Ya existe un registro con esos datos.",
    "23514": "Los datos ingresados no cumplen con las reglas establecidas.",
    "22P02": "Uno de los datos ingresados no tiene un formato válido.",
    "22001": "Uno de los datos ingresados es demasiado largo.",
    "22003": "Uno de los valores está fuera del rango permitido.",
  };

  if (code && POSTGRES_ERROR_MESSAGES[code]) {
    return POSTGRES_ERROR_MESSAGES[code];
  }

  // 4. Capturar errores personalizados de RPCs (P0001 u otros prefijos P)
  if (code.startsWith("P") && message) {
    return message;
  }

  // 5. Red de seguridad: si TanStack Query capturó un Error con mensaje (ej. tu RAISE EXCEPTION)
  if (message && message.trim()) {
    return message;
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
