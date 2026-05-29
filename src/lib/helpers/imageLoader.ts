// lib/helpers/imageLoader.ts
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

// lib/helpers/imageLoader.ts
// lib/helpers/imageLoader.ts
export function catalogImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  const w = width <= 640 ? 500 : 800; // móvil → 500, desktop → 800 (tu máximo)
  return getCatalogImageUrl(src, w, 80);
}
