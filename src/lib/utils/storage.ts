// src/lib/utils/storage.ts
//import { createClient } from "@/lib/supabase/supabaseServer";
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
  //const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const path = fileName
    ? `${userId}/${folder}/${fileName}.${ext}` // fijo → sobreescribe
    : `${userId}/${folder}/${Date.now()}.${ext}`; // único → acumula

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

/**
 * Delete a file from Supabase Storage given its public URL
 * @param bucket
 * @param url
 */
export const deleteFile = async (
  bucket: string,
  url: string,
): Promise<void> => {
  const supabase = await createClient();

  // extraer el path de la url publica
  const path = url.split(`${bucket}/`)[1];

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
};
