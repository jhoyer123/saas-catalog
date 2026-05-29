// components/skeletons/ProductGridSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  headerHeight?: number;
}

export function ProductGridSkeleton({ headerHeight = 0 }: Props) {
  return (
    <main className="min-h-screen bg-catalog-primary pb-6">
      {/* Spacer que imita el div del header real */}
      <div style={{ height: headerHeight }} />

      {/* Barra sticky igual que el catálogo real */}
      <div
        className="bg-catalog-primary py-2 sticky z-20 h-full w-full flex items-center justify-center lg:hidden"
        style={{ top: headerHeight }}
      >
        <Skeleton className="h-10 w-64 rounded-xl bg-white/70" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-62.5 w-full rounded-xl bg-white/70" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80%] bg-white/70" />
              <Skeleton className="h-4 w-[40%] bg-white/70" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
