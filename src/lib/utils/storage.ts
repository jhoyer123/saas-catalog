import { createClient } from "@/lib/supabase/supabaseClient";

export type UploadResult = {
  path: string; // path relativo dentro del bucket (guardar esto en tu DB)
  publicUrl: string; // URL pública lista para usar en <img src>
};

type UploadFileParams = {
  bucket: string;
  //storeId: string;
  folder: string; // soporta rutas anidadas, ej: "products/variants"
  file: File; // el archivo a subir
};

/**
 * Función global de subida. Úsala para TODO archivo del storage
 * (branding, banners, categories, brands, option-values, products, variants).
 */
export const uploadFile = async ({
  bucket,
  folder,
  file,
}: UploadFileParams): Promise<UploadResult> => {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const finalName = crypto.randomUUID();
  const path = `${folder}/${finalName}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || "image/webp",
    });

  if (error) {
    throw new Error(`Error subiendo "${path}": ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { path: data.path, publicUrl };
};

/**
 * Sube varios archivos en paralelo. No falla todo el batch si uno falla:
 * devuelve resultados y errores por separado.
 */
export const uploadMultipleFiles = async (
  params: Omit<UploadFileParams, "file" | "fileName">,
  files: File[],
  concurrency = 5, // sube de a 5 en paralelo, no las 10/50 de golpe
): Promise<{
  successes: UploadResult[];
  errors: { file: File; message: string }[];
}> => {
  const successes: UploadResult[] = [];
  const errors: { file: File; message: string }[] = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      chunk.map((file) => uploadFile({ ...params, file })),
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        successes.push(result.value);
      } else {
        errors.push({
          file: chunk[idx],
          message: result.reason?.message ?? "Error desconocido",
        });
      }
    });
  }

  return { successes, errors };
};

/**
 * Borra un archivo por su path relativo (el que guardaste en tu DB).
 * Necesario para banners/galería/variantes que usan UUID y no se
 * sobreescriben solos al eliminarlos desde la UI.
 */
export const deleteFile = async (
  bucket: string,
  path: string | string[],
): Promise<void> => {
  const supabase = createClient();
  const paths = Array.isArray(path) ? path : [path];
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw new Error(`Error eliminando archivo(s): ${error.message}`);
};

/**
 * Borra TODO lo que esté bajo un prefijo (carpeta), incluyendo subcarpetas.
 * Útil para: eliminar un producto completo (incluye /variants adentro),
 * o limpiar toda la carpeta de banners/categories de una tienda.
 *
 * Ej: deleteFolder("stores", `${storeId}/products/${productId}`)
 * borra galería + variants/ completo.
 */
export const deleteFolder = async (
  bucket: string,
  prefix: string,
): Promise<void> => {
  const supabase = createClient();

  const allPaths: string[] = [];

  // Recorre recursivamente listando carpetas y archivos
  const collectPaths = async (path: string) => {
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 1000, // ajusta si esperas más de 1000 archivos por carpeta
    });

    if (error) {
      throw new Error(`Error listando "${path}": ${error.message}`);
    }
    if (!data || data.length === 0) return;

    for (const item of data) {
      const itemPath = `${path}/${item.name}`;
      // Supabase marca las "carpetas" con id === null (son solo prefijos virtuales)
      if (item.id === null) {
        await collectPaths(itemPath); // es subcarpeta → recursión
      } else {
        allPaths.push(itemPath); // es archivo
      }
    }
  };

  await collectPaths(prefix);

  if (allPaths.length === 0) return; // nada que borrar

  const { error } = await supabase.storage.from(bucket).remove(allPaths);
  if (error) {
    throw new Error(`Error eliminando carpeta "${prefix}": ${error.message}`);
  }
};

/**
 * Sube imágenes de un producto, agrupadas por firma.
 * Útil para subir imágenes generales y variantes de un producto.
 */
type UploadInputBySignature = Record<string, { newFiles: File[] }>;

export async function uploadProductImagesGrouped(params: {
  storeId: string;
  productId: string;
  general: { newFiles: File[] };
  bySignature: UploadInputBySignature;
}) {
  const { storeId, productId, general, bySignature } = params;
  const base = `${storeId}/products/${productId}`;

  // Subimos general
  const generalUpload = await uploadMultipleFiles(
    { bucket: "stores", folder: `${base}/general` },
    general.newFiles,
  );

  // Subimos variantes
  const bySignatureUpload: Record<
    string,
    { successes: string[]; errors: any[] } // <--- Aquí cambiamos para que successes sea un array de strings (paths)
  > = {};

  for (const [sig, group] of Object.entries(bySignature)) {
    if (!group.newFiles.length) continue;

    const sigUpload = await uploadMultipleFiles(
      { bucket: "stores", folder: `${base}/variants/${sig}` },
      group.newFiles,
    );

    bySignatureUpload[sig] = {
      successes: sigUpload.successes.map((s) => s.path), // <--- Extraemos solo el path relativo
      errors: sigUpload.errors,
    };
  }

  return {
    general: {
      successes: generalUpload.successes.map((s) => s.path), // <--- Extraemos solo el path relativo
      errors: generalUpload.errors,
    },
    bySignature: bySignatureUpload,
  };
}
