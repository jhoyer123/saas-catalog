import { Skeleton } from "../ui/skeleton";

export const SkeletonDetailProduct = () => {
  return (
    <div className="min-h-screen bg-catalog-primary px-4 py-6">
      {/* Volver */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-14 h-4 rounded" />
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 max-w-5xl mx-auto">
        <div>
          <Skeleton className="w-full aspect-3/4 rounded-2xl mb-3" />
          <div className="flex gap-3">
            <Skeleton className="w-18 h-18 rounded-xl" />
            <Skeleton className="w-18 h-18 rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 flex flex-col gap-5 border border-gray-100">
          <Skeleton className="w-24 h-3 rounded" />
          <div className="space-y-2">
            <Skeleton className="w-full h-7 rounded" />
            <Skeleton className="w-3/4 h-7 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-7 rounded-full" />
            <Skeleton className="w-28 h-7 rounded-full" />
          </div>
          <Skeleton className="w-36 h-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-44 h-5 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-5/6 h-4 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-28 h-5 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-11/12 h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
          </div>
          <div className="flex gap-3 mt-2">
            <Skeleton className="flex-1 h-11 rounded-xl" />
            <Skeleton className="flex-1 h-11 rounded-xl" />
          </div>
        </div>
      </div>

      {/* ─── MOBILE ─── */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Imagen principal */}
        <div className="relative">
          <Skeleton className="w-full h-85 rounded-2xl" />
          <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" />
          <Skeleton className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" />
        </div>

        {/* Thumbnails */}
        <div className="flex items-center justify-center gap-3 px-1">
          <Skeleton className="w-17 h-17 rounded-xl" />
          <Skeleton className="w-17 h-17 rounded-xl" />
        </div>

        {/* Card info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-5">
          <Skeleton className="w-24 h-3 rounded" />

          <div className="space-y-2">
            <Skeleton className="w-full h-6 rounded" />
            <Skeleton className="w-4/5 h-6 rounded" />
            <Skeleton className="w-3/5 h-6 rounded" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="w-24 h-7 rounded-full" />
            <Skeleton className="w-28 h-7 rounded-full" />
          </div>

          {/* Precio grande */}
          <Skeleton className="w-40 h-12 rounded-lg" />

          <div className="border-t border-gray-100" />

          <div className="space-y-2">
            <Skeleton className="w-20 h-3 rounded" />
            <Skeleton className="w-48 h-5 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-5/6 h-4 rounded" />
          </div>

          <div className="space-y-2">
            <Skeleton className="w-28 h-5 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-11/12 h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>

          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
