// lib/utils/imageUrl.ts
const SUPABASE_STORAGE =
  "https://ffippkblrlgsmzlhretb.supabase.co/storage/v1/object/public/";
const CLOUDFLARE_WORKER = "https://supabase-images.jhoyervega4.workers.dev/";

export function getCatalogImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/placeholder.webp";
  if (url.startsWith("http"))
    return url.replace(SUPABASE_STORAGE, CLOUDFLARE_WORKER);
  return CLOUDFLARE_WORKER + "/" + url;
}
