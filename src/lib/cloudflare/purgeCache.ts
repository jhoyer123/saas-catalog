// lib/cloudflare/purgeCache.ts

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID!;
const TOKEN = process.env.CLOUDFLARE_CACHE_TOKEN!;
const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.jhoyerdev.me"
).replace(/\/+$/, "");

async function purgeCloudflareCache(
  urls: string[],
  retries = 3,
): Promise<boolean> {
  if (!ZONE_ID || !TOKEN || !urls.length) return false;

  for (let i = 0; i < retries; i++) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: urls }),
      },
    );

    const body = await res.json().catch(() => null);

    if (res.ok && body?.success) return true;

    console.warn(`Cloudflare purge intento ${i + 1} fallido`, {
      status: res.status,
      body,
    });
    await new Promise((r) => setTimeout(r, 1000 * (i + 1))); // 1s, 2s, 3s
  }

  console.error("Cloudflare purge falló después de todos los intentos", {
    urls,
  });
  return false;
}

export async function purgeCatalogCache(storeSlug: string) {
  return purgeCloudflareCache([`${APP_URL}/public/${storeSlug}`]);
}

export async function purgeProductDetailCache(
  storeSlug: string,
  productSlug: string,
) {
  return purgeCloudflareCache([
    `${APP_URL}/public/${storeSlug}/${productSlug}`,
  ]);
}

/* async function purgeCloudflareCache(urls: string[]) {
  if (!ZONE_ID || !TOKEN || !urls.length) return;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: urls }),
    },
  );

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    console.error("Cloudflare purge failed", { status: res.status, body });
    throw new Error("Cloudflare purge failed");
  }
} */

//vista pública principal del catálogo
/* export async function purgeCatalogCache(storeSlug: string) {
  await purgeCloudflareCache([`${APP_URL}/public/${storeSlug}`]);
} */

//vista pública detalle del producto
/* export async function purgeProductDetailCache(
  storeSlug: string,
  productSlug: string,
) {
  await purgeCloudflareCache([`${APP_URL}/public/${storeSlug}/${productSlug}`]);
} */
