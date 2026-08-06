"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { purgeCatalogCache } from "../cloudflare/purgeCache";
import { cacheTag } from "../helpers/cacheKeys";

// action solo para revalidar cache de banners (sin tocar DB ni storage)
export async function revalidateBannersCacheAction(storeSlug: string) {
  revalidateTag(cacheTag("banners", storeSlug), "max");
  revalidatePath(`/public/${storeSlug}`);
  if (storeSlug) await purgeCatalogCache(storeSlug);
}
