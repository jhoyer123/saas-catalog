import { createClient } from "@/lib/supabase/supabaseClient";

// estructura: bucket/userId/carpeta/archivo
// ejemplo:  stores/uuid-user/logo/logo.webp

export const uploadFile = async (
  bucket: string,
  userId: string,
  folder: string,
  file: File,
  fileName?: string, // <-- opcional
): Promise<string> => {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  // Ahora usamos UUID para garantizar unicidad incluso si 2+ imágenes se suben en <1ms (paralelo)
  const path = fileName
    ? `${userId}/${folder}/${fileName}.${ext}` // fijo → sobreescribe (para logos, etc)
    : `${userId}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`; // único + UUID
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
};
