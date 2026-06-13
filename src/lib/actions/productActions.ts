"use server";
import { revalidateTag, revalidatePath } from "next/cache";
import {
  purgeCatalogCache,
  purgeProductDetailCache,
} from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";

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
