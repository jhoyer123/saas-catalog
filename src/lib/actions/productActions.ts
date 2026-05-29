"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  purgeCatalogCache,
  purgeProductDetailCache,
} from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";
//-------------------------------
import { createClient } from "../supabase/supabaseClient";
import cloudinary from "@/lib/cloudinary/cloudinary";
import * as Sentry from "@sentry/nextjs";
//---------------------------------

/**
 * @param slugProd
 * @param storeSlug
 * @returns
 * Esta función se encarga de limpiar la cache de Next.js y Cloudflare del catálogo y detalle del producto.
 */
export const revalidateProductCache = async (
  storeSlug: string,
  slugProd: string | null,
) => {
  //revalidateTag(`products-${storeSlug}`, "max");
  revalidateTag(cacheTag("products", storeSlug), "max");
  revalidatePath(`/public/${storeSlug}`);
  await purgeCatalogCache(storeSlug);

  if (slugProd) {
    //revalidateTag(`product-${storeSlug}-${slugProd}`, "max");
    revalidateTag(cacheTag(`product-${slugProd}`, storeSlug), "max");
    revalidatePath(`/public/${storeSlug}/${slugProd}`);
    await purgeProductDetailCache(storeSlug, slugProd);
  }
};

//---------------------------------------------------
const getPublicId = (urlOrPath: string): string => {
  let path = urlOrPath;
  if (path.startsWith("http")) {
    path = new URL(urlOrPath).pathname.replace(
      "/storage/v1/object/public/",
      "",
    );
  }
  return path.replace(/\.[^/.]+$/, "");
};

export const deleteProductAction = async (id: string, storeId: string) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // 1. Obtener URLs de imágenes antes de borrar
  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", id);

  // 2. Borrar en DB (usa tu RPC o cascade delete)
  const { error } = await supabase.rpc("delete_product", {
    p_product_id: id,
  });

  if (error) {
    Sentry.captureException(error, { extra: { id, storeId } });
    console.error("deleteProductAction DB ERROR:", error);
    return { error: "Error al eliminar el producto" };
  }

  // 3. Borrar imágenes de Cloudinary
  if (images && images.length > 0) {
    try {
      await Promise.all(
        images.map((img) =>
          cloudinary.uploader.destroy(getPublicId(img.image_url)),
        ),
      );
    } catch (err) {
      // El producto ya se borró de DB, solo logueas
      Sentry.captureException(err, { extra: { id } });
      console.error("deleteProductAction Cloudinary ERROR:", err);
    }
  }

  return { success: true };
};
