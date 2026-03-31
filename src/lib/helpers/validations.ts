/**
 * Verifica si una oferta está vigente.
 * Toda comparación se hace en UTC para evitar desfases con Bolivia (UTC-4).
 *
 * Casos:
 * - is_offer false o sin precio → no activa
 * - sin fechas → activa indefinidamente
 * - con solo offer_start → activa desde esa fecha en adelante
 * - con solo offer_end → activa hasta esa fecha
 * - con ambas → activa dentro del rango
 *
 * @param product - Producto con campos de oferta
 * @param now - Fecha de referencia (default: Date.now()). Útil para tests.
 */
export function checkIsOfferActive(
  product: {
    is_offer: boolean;
    offer_price: number | null;
    offer_start: string | null;
    offer_end: string | null;
  },
  now: Date = new Date(),
): boolean {
  if (!product.is_offer || !product.offer_price) return false;

  // Sin fechas = oferta indefinida
  if (!product.offer_start && !product.offer_end) return false;

  // Comparar timestamps UTC directamente (getTime() siempre es UTC)
  const nowMs = now.getTime();
  const startMs = product.offer_start
    ? new Date(product.offer_start).getTime()
    : null;
  const endMs = product.offer_end
    ? new Date(product.offer_end).getTime()
    : null;
  if (startMs !== null && nowMs < startMs) return false;
  if (endMs !== null && nowMs > endMs) return false;

  return true;
}

/**
 * Verifica si una tienda tiene un plan vigente.
 * Toda comparación se hace en UTC para evitar desfases con Bolivia (UTC-4).
 *
 * Casos:
 * - is_active false → no vigente
 * - plan_expires_at null → no vigente (nunca se configuró)
 * - plan_expires_at en el pasado → expirado
 * - plan_expires_at en el futuro → vigente
 *
 * @param store - Tienda con campos de plan
 * @param now - Fecha de referencia (default: Date.now()). Útil para tests.
 */
export function checkIsPlanActive(
  store: {
    is_active: boolean | null;
    plan_expires_at: string | null;
  },
  now: Date = new Date(),
): boolean {
  if (!store.is_active) return false;
  if (!store.plan_expires_at) return false;

  // Comparar timestamps UTC directamente (getTime() siempre es UTC)
  const nowMs = now.getTime();
  const expiresMs = new Date(store.plan_expires_at).getTime();

  if (nowMs > expiresMs) return false;

  return true;
}
