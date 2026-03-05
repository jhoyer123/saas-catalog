import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPanel() {
  return (
    <section className="mx-auto max-w-4xl w-full space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}
