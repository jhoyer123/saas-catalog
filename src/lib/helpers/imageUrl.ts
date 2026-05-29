// lib/utils/imageUrl.ts
/* const SUPABASE_STORAGE =
  "https://ffippkblrlgsmzlhretb.supabase.co/storage/v1/object/public";
const CLOUDFLARE_WORKER = "https://supabase-images.jhoyervega4.workers.dev";

export function getCatalogImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/placeholder.webp";
  return url.replace(SUPABASE_STORAGE, CLOUDFLARE_WORKER);
}
 */
/* import { SUPABASE_PUBLIC_URL } from "@/constants/storage";
const SUPABASE_STORAGE = SUPABASE_PUBLIC_URL;
const CLOUDFLARE_WORKER =
  "https://cloudinary-proxy-service.jhoyervega4.workers.dev/";

export function getCatalogImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/placeholder.webp";
  if (url.includes(SUPABASE_STORAGE)) {
    return url.replace(SUPABASE_STORAGE, CLOUDFLARE_WORKER);
  } else {
    return CLOUDFLARE_WORKER + url;
  }
} */

import { SUPABASE_PUBLIC_URL, CLOUDFLARE_WORKER } from "@/constants/storage";

const SUPABASE_STORAGE = SUPABASE_PUBLIC_URL;
const CLOUDINARY_UPLOAD_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

function appendImageParams(url: string, width?: number, quality?: number) {
  const params = new URLSearchParams();

  if (width) params.set("w", String(width));
  if (quality) params.set("q", String(quality));

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function getCatalogImageUrl(
  url: string | null | undefined,
  width?: number,
  quality?: number,
): string {
  if (!url) return "/images/placeholder.webp";

  if (url.startsWith(CLOUDFLARE_WORKER)) {
    return appendImageParams(url, width, quality);
  }

  const normalizedPath = url
    .replace(SUPABASE_STORAGE, "")
    .replace(CLOUDINARY_UPLOAD_BASE, "")
    .replace(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/?/, "")
    .replace(/^\/+/, "");

  const workerUrl = `${CLOUDFLARE_WORKER}${normalizedPath}`;
  return appendImageParams(workerUrl, width, quality);
}
