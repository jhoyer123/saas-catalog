import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Lado izquierdo - imagen principal + thumbnails */}
        <div className="flex flex-col gap-3 w-full md:w-1/2">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <Skeleton className="w-20 h-20 rounded-lg" />
            <Skeleton className="w-20 h-20 rounded-lg" />
          </div>
        </div>

        {/* Lado derecho - info */}
        <div className="flex flex-col gap-5 w-full md:w-1/2">
          {/* Badge disponibilidad */}
          <Skeleton className="h-8 w-28 rounded-full" />

          {/* Nombre y marca */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
          </div>

          {/* Precio */}
          <Skeleton className="h-10 w-1/3" />

          {/* Descripción */}
          <div className="flex flex-col gap-2 border-t pt-5">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
