import Skeleton from './Skeleton';

/** Skeleton for Deductions page when loading and no data yet. */
export default function DeductionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" variant="rounded" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" variant="text" />
              <Skeleton className="h-4 w-56" variant="text" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" variant="rounded" />
        </div>
      ))}
    </div>
  );
}
