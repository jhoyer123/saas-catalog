"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";

/**
 * revalidate brands cache for a store
 */
export async function revalidateBrandsCache(storeSlug: string) {
  revalidateTag(cacheTag("brands", storeSlug), "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
}
