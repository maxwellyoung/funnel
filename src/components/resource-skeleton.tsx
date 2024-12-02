export function ResourceSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded w-16" />
              <div className="h-5 bg-muted rounded w-16" />
            </div>
            <div className="h-2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
