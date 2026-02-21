import Skeleton from './Skeleton';

/** Skeleton for Reports page. */
export default function ReportsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" variant="rounded" />
          <Skeleton className="h-4 w-48" variant="text" />
        </div>
        <Skeleton className="h-10 w-24" variant="rounded" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-40" variant="rounded" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-3/4" variant="text" />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" variant="text" />
                <Skeleton className="h-4 w-24" variant="text" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" variant="text" />
                <Skeleton className="h-4 w-16" variant="text" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-9 w-28" variant="rounded" />
              <Skeleton className="h-9 w-24" variant="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
