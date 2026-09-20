import { Skeleton } from "../ui/skeleton";

const SkeletonForm = () => {
  return (
    <div className="w-full mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 self-start sm:self-auto" />
      </div>

      {/* 1. Variantes */}
      <div className="p-6 rounded-xl border border-border/40 space-y-4 bg-card">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>

      {/* 2. Información general */}
      <div className="p-6 rounded-xl border border-border/40 space-y-6 bg-card">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* 3. Contenido y medios */}
      <div className="p-6 rounded-xl border border-border/40 space-y-6 bg-card">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-36 w-full rounded-md" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-52 w-52 rounded-xl" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* 4. Precio del Producto */}
      <div className="p-6 rounded-xl border border-border/40 space-y-4 bg-card">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-2 max-w-xs">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonForm;
