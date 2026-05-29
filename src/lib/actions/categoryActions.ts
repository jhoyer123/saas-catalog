"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";

/**
 * Revalidates the public catalog cache for a specific tag and store slug for categories.
 * @param storeSlug
 */
export async function revalidateCategoriesCache(storeSlug: string) {
  revalidateTag(cacheTag("categories", storeSlug), "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) {
    await purgeCatalogCache(storeSlug);
  }
}
