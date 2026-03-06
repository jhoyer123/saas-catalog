/**
 * Suspense boundary para /dashboard/panel.
 *
 * Se muestra inmediatamente al navegar mientras el servidor ejecuta
 * getProductCount() + getSessionDataCached() (las únicas llamadas async
 * que bloquean en el dashboard).
 *
 * No interfiere con TanStack Query: este skeleton cubre la FASE servidor.
 * Una vez que el RSC llega al cliente, HydrationBoundary inyecta los datos
 * en cache y TanStack no hace ninguna petición extra.
 */

import SkeletonPanel from "@/components/panel/SkeletonPanel";

export default function Loading() {
  return (
    <div className="p-4">
      <SkeletonPanel />
    </div>
  );
}
