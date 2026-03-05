"use client";

import { Skeleton } from "@/components/ui/skeleton";

const HeaderSidebarSkeleton = () => {
  return (
    <div className="w-full flex items-center justify-center gap-2 pt-2 pb-3 border-b">
      {/* Logo Skeleton */}
      <Skeleton
        className="rounded-lg 
                           h-8 w-8 
                           sm:h-9 sm:w-9 
                           md:h-10 md:w-10"
      />

      {/* Text Skeleton */}
      <Skeleton
        className="h-5 
                           w-24 
                           sm:w-32 
                           md:w-40"
      />
    </div>
  );
};

export default HeaderSidebarSkeleton;
