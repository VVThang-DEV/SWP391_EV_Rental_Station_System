import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Common skeleton patterns
export const VehicleCardSkeleton = () => (
  <div className="card-hover space-y-4 p-4">
    <div className="relative">
      <Skeleton className="w-full h-56 rounded-lg" />
      <div className="absolute top-3 left-3">
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="absolute top-3 right-3">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-start gap-5">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

export const StationCardSkeleton = () => (
  <div className="card-hover space-y-4 p-6">
    <div className="flex items-start gap-6">
      <Skeleton className="h-14 w-14 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>

    <div className="grid grid-cols-3 gap-6 text-center">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-7 w-10 mx-auto" />
          <Skeleton className="h-4 w-14 mx-auto" />
        </div>
      ))}
    </div>

    <Skeleton className="h-12 w-full rounded-lg" />
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="card-hover p-6">
    <div className="flex items-center space-x-6">
      <div className="p-3 bg-muted rounded-full">
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  </div>
);

export { Skeleton };
