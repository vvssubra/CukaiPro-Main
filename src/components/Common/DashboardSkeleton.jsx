import Skeleton from './Skeleton';

/** Skeleton for Dashboard overview. */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" variant="rounded" />
          <Skeleton className="h-4 w-48" variant="text" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" variant="rounded" />
          <Skeleton className="h-10 w-10" variant="rounded" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Featured card */}
        <div className="col-span-12 lg:col-span-8 row-span-2 rounded-xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-4 w-40" variant="text" />
          <Skeleton className="h-14 w-48" variant="rounded" />
          <Skeleton className="h-4 w-56" variant="text" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-28" variant="rounded" />
            <Skeleton className="h-10 w-28" variant="rounded" />
          </div>
        </div>

        {/* Right column cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <Skeleton className="h-4 w-24" variant="text" />
            <Skeleton className="h-8 w-32" variant="rounded" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <Skeleton className="h-4 w-28" variant="text" />
            <Skeleton className="h-8 w-36" variant="rounded" />
          </div>
        </div>

        {/* Bottom cards */}
        <div className="col-span-12 lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <Skeleton className="h-5 w-36" variant="rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" variant="text" />
                <Skeleton className="h-3 w-20" variant="text" />
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <Skeleton className="h-5 w-40" variant="rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-2">
                <Skeleton className="h-4 w-48" variant="text" />
                <Skeleton className="h-4 w-24" variant="text" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
