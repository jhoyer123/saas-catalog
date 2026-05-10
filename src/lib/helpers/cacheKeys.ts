const CACHE_VERSION = "v1";

export function cacheKey(prefix: string, storeSlug: string, extra?: string) {
  return [`${prefix}-${CACHE_VERSION}`, storeSlug, ...(extra ? [extra] : [])];
}

export function cacheTag(prefix: string, storeSlug: string) {
  return `${prefix}-${CACHE_VERSION}-${storeSlug}`;
}
