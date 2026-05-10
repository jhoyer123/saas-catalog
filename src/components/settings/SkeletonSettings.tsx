import { Skeleton } from "@/components/ui/skeleton";

// --- Skeleton de una sucursal individual ---
function SucursalCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
      {/* Header: título + botón quitar */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>

      {/* Nombre + Teléfono en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    </div>
  );
}

// --- Skeleton de una red social ---
function RedSocialCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      {/* Ícono + nombre */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Label URL */}
      <Skeleton className="h-3.5 w-10" />
      {/* Input URL */}
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

// --- Skeleton principal de la página ---
export default function SkeletonSettings() {
  return (
    <div className="w-full p-4">
      <div className="mx-auto max-w-6xl w-full space-y-8">
        {/* ── Encabezado de página ── */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 sm:w-80" />
          <Skeleton className="h-4 w-72 sm:w-96" />
        </div>

        {/* ══════════════════════════════════
          Sección: Sucursales
      ══════════════════════════════════ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 space-y-5">
          {/* Título sección */}
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-wrap items-center gap-1">
              <Skeleton className="h-3.5 w-64 sm:w-80" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>

          {/* Botón Agregar sucursal */}
          <Skeleton className="h-9 w-40 rounded-md" />

          {/* Grid de sucursales: 1 col mobile → 2 cols desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SucursalCardSkeleton />
            <SucursalCardSkeleton />
          </div>

          {/* Botón Guardar cambios (sucursales) */}
          <div className="flex justify-end">
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>

        {/* ══════════════════════════════════
          Sección: Redes Sociales
      ══════════════════════════════════ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 space-y-5">
          {/* Título sección */}
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36" />
            <div className="flex flex-wrap items-center gap-1">
              <Skeleton className="h-3.5 w-72 sm:w-96" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>

          {/* Grid de redes: 1 col mobile → 2 cols sm → 4 cols lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RedSocialCardSkeleton />
            <RedSocialCardSkeleton />
            <RedSocialCardSkeleton />
            <RedSocialCardSkeleton />
          </div>

          {/* Botón Guardar cambios (redes) */}
          <div className="flex justify-end">
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
