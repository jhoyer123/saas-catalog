//import { createClient } from "@/lib/supabase/supabaseClient";

// estructura: bucket/userId/carpeta/archivo
// ejemplo:  stores/uuid-user/logo/logo.webp

/* export const uploadFile = async (
  bucket: string,
  userId: string,
  folder: string,
  file: File,
  fileName?: string, // <-- opcional
): Promise<string> => {
  const supabase = await createClient();

  const ext = file.name.split(".").pop();

  // ==================== NUEVO: Date.now() + UUID para evitar colisiones ====================
  // Ahora usamos UUID para garantizar unicidad incluso si 2+ imágenes se suben en <1ms (paralelo)
  const path = fileName
    ? `${userId}/${folder}/${fileName}.${ext}` // fijo → sobreescribe (para logos, etc)
    : `${userId}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`; // único + UUID
  // =======================================================================================

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}; */

import { CLOUDINARY_URL } from "@/constants/storage";

//con cloudinary (recomendado para producción por su optimización y CDN)
export const uploadFile = async (
  bucket: string,
  userId: string,
  folder: string,
  file: File,
  fileName?: string,
): Promise<string> => {
  const ext = file.name.split(".").pop();

  const public_id = fileName
    ? `${userId}/${folder}/${fileName}` // fijo → sobreescribe
    : `${userId}/${folder}/${Date.now()}-${crypto.randomUUID()}`; // único

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
  formData.append("folder", bucket);
  formData.append("public_id", public_id);

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  // retorna solo el path relativo (sin el prefijo de cloudinary)
  return `${bucket}/${public_id}.${ext}`;
};
