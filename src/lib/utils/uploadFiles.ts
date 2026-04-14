"use client";

import { createClient } from "@/lib/supabase/supabaseClient";

export const uploadImages = async (
  files: File[],
  storeId: string,
): Promise<string[]> => {
  const supabase = createClient();

  const uploads = files.map(async (file) => {
    const ext = file.name.split(".").pop();
    const path = `${storeId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(path, file);

    if (error) throw new Error(error.message);

    const { data: publicUrl } = supabase.storage
      .from("products")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  });

  return Promise.all(uploads);
};
