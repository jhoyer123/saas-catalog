import { Skeleton } from "@/components/ui/skeleton";

const SkeletonForm = () => {
  return (
    <div className="w-full mx-auto grid gap-6 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};

export default SkeletonForm;
