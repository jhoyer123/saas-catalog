import { createClient } from "@/lib/supabase/supabaseClient";

const WORKER_URL = "https://r2-image-up-saas-catalog.jhoyervega4.workers.dev";

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL!;

// ============================================================
// AUTH / OWNERSHIP
// ============================================================

/**
 * Verifica que la tienda pertenezca al usuario autenticado.
 *
 * Retorna también la sesión para reutilizar el access_token
 * y evitar llamar nuevamente a supabase.auth.getSession().
 */
export const verifyStoreOwnership = async (storeId: string) => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No autenticado");
  }

  const { data: store, error } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", session.user.id)
    .single();

  if (error || !store) {
    throw new Error("No tienes acceso a esta tienda");
  }

  return {
    storeId: store.id,
    userId: session.user.id,
    session,
  };
};

// ============================================================
// TYPES
// ============================================================

export type UploadResult = {
  path: string;
  publicUrl: string;
};

type PresignedFile = {
  key: string;
  uploadUrl: string;
};

type UploadInputBySignature = Record<
  string,
  {
    newFiles: File[];
  }
>;

// ============================================================
// WORKER - PRESIGNED URLS
// ============================================================

/**
 * Solicita URLs presignadas al Worker.
 *
 * El token ya fue obtenido mediante verifyStoreOwnership(),
 * por lo que no volvemos a consultar Supabase Auth aquí.
 */
async function getSignedUrls(
  folder: string,
  files: File[],
  accessToken: string,
): Promise<PresignedFile[]> {
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      folder,
      files: files.map((file) => ({
        fileName: file.name,
        contentType: file.type || "image/webp",
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const { files: presigned } = (await res.json()) as {
    files: PresignedFile[];
  };
  return presigned;
}

// ============================================================
// UPLOAD MULTIPLE FILES
// ============================================================

/**
 * Sube múltiples archivos usando URLs presignadas.
 *
 * IMPORTANTE:
 * La ownership se verifica UNA SOLA VEZ antes de solicitar
 * las URLs presignadas.
 */
async function uploadMultipleFilesWithToken(
  params: {
    folder: string;
    accessToken: string;
  },
  files: File[],
): Promise<{
  successes: UploadResult[];
  errors: { file: File; message: string }[];
}> {
  const successes: UploadResult[] = [];
  const errors: { file: File; message: string }[] = [];

  if (!files.length) {
    return {
      successes,
      errors,
    };
  }

  const presigned = await getSignedUrls(
    params.folder,
    files,
    params.accessToken,
  );

  const results = await Promise.allSettled(
    presigned.map((presignedFile, index) =>
      fetch(presignedFile.uploadUrl, {
        method: "PUT",
        body: files[index],
        headers: {
          "Content-Type": files[index].type || "image/webp",
        },
      }),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.ok) {
      successes.push({
        path: presigned[index].key,
        publicUrl: `${CDN_URL}/${presigned[index].key}`,
      });
    } else {
      errors.push({
        file: files[index],
        message: "Error subiendo archivo",
      });
    }
  });

  return {
    successes,
    errors,
  };
}

/**
 * API pública para subir múltiples archivos.
 *
 * Se mantiene separada para que el resto del proyecto pueda
 * seguir usando uploadMultipleFiles().
 */
export const uploadMultipleFiles = async (
  params: {
    storeId: string;
    folder: string;
  },
  files: File[],
): Promise<{
  successes: UploadResult[];
  errors: { file: File; message: string }[];
}> => {
  const { session } = await verifyStoreOwnership(params.storeId);

  return uploadMultipleFilesWithToken(
    {
      folder: params.folder,
      accessToken: session.access_token,
    },
    files,
  );
};

// ============================================================
// UPLOAD SINGLE FILE
// ============================================================

export const uploadFile = async ({
  storeId,
  folder,
  file,
}: {
  storeId: string;
  folder: string;
  file: File;
}): Promise<UploadResult> => {
  const { session } = await verifyStoreOwnership(storeId);

  const [presigned] = await getSignedUrls(folder, [file], session.access_token);

  const put = await fetch(presigned.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "image/webp",
    },
  });

  if (!put.ok) {
    throw new Error(`Error subiendo "${presigned.key}"`);
  }

  return {
    path: presigned.key,
    publicUrl: `${CDN_URL}/${presigned.key}`,
  };
};

// ============================================================
// DELETE
// ============================================================

/**
 * Obtiene una sesión para operaciones que no necesitan
 * verificar una tienda concreta.
 */
async function getAccessToken(): Promise<string> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No autenticado");
  }

  return session.access_token;
}

/**
 * Borra archivos puntuales por su key.
 */
export const deleteFile = async (path: string | string[]): Promise<void> => {
  const keys = Array.isArray(path) ? path : [path];

  const token = await getAccessToken();

  const res = await fetch(WORKER_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      keys,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error eliminando archivo(s): ${await res.text()}`);
  }
};

/**
 * Borra TODO lo que esté bajo un prefijo.
 *
 * Ejemplo:
 * deleteFolder(`${storeId}/products/${productId}`)
 */
export const deleteFolder = async (prefix: string): Promise<void> => {
  const token = await getAccessToken();

  const res = await fetch(WORKER_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prefix,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Error eliminando carpeta "${prefix}": ${await res.text()}`,
    );
  }
};

// ============================================================
// HASH SIGNATURE
// ============================================================

/**
 * Genera un hash corto compatible con navegador.
 *
 * Evita importar "crypto" de Node en código cliente.
 */
async function hashSignature(sig: string): Promise<string> {
  const data = new TextEncoder().encode(sig);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex.slice(0, 12);
}

// ============================================================
// PRODUCT IMAGES
// ============================================================

/**
 * Sube las imágenes generales y las imágenes de variantes
 * de un producto.
 *
 * La tienda se verifica UNA SOLA VEZ.
 *
 * Después se reutiliza el mismo access_token para todas
 * las llamadas al Worker.
 */
export async function uploadProductImagesGrouped(params: {
  storeId: string;
  productId: string;
  general: {
    newFiles: File[];
  };
  bySignature: UploadInputBySignature;
}) {
  const { storeId, productId, general, bySignature } = params;

  // ==========================================================
  // 1. Verificar ownership UNA SOLA VEZ
  // ==========================================================

  const { session } = await verifyStoreOwnership(storeId);

  const accessToken = session.access_token;

  // ==========================================================
  // 2. Base del producto
  // ==========================================================

  const base = `${storeId}/products/${productId}`;

  // ==========================================================
  // 3. Imágenes generales
  // ==========================================================

  const generalUpload = await uploadMultipleFilesWithToken(
    {
      folder: `${base}/general`,
      accessToken,
    },
    general.newFiles,
  );

  // ==========================================================
  // 4. Imágenes de variantes
  // ==========================================================

  const bySignatureUpload: Record<
    string,
    {
      successes: string[];
      errors: { file: File; message: string }[];
    }
  > = {};

  for (const [sig, group] of Object.entries(bySignature)) {
    if (!group.newFiles.length) {
      continue;
    }

    const safeFolder = await hashSignature(sig);

    const sigUpload = await uploadMultipleFilesWithToken(
      {
        folder: `${base}/variants/${safeFolder}`,
        accessToken,
      },
      group.newFiles,
    );

    bySignatureUpload[sig] = {
      successes: sigUpload.successes.map((success) => success.path),
      errors: sigUpload.errors,
    };
  }

  // ==========================================================
  // 5. Resultado
  // ==========================================================

  return {
    general: {
      successes: generalUpload.successes.map((success) => success.path),
      errors: generalUpload.errors,
    },

    bySignature: bySignatureUpload,
  };
}
