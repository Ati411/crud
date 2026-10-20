export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 h-8 w-64 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-40 rounded bg-slate-200"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-48 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* Table Container Skeleton */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full max-w-2xl gap-4">
              <div className="h-10 flex-1 rounded-md bg-slate-100"></div>
              <div className="h-10 w-40 rounded-md bg-slate-100"></div>
            </div>
            <div className="h-10 w-32 rounded-lg bg-slate-200"></div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 pb-4"
                >
                  <div className="flex items-center gap-8">
                    <div className="h-4 w-8 rounded bg-slate-200"></div>
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                    <div className="h-4 w-40 rounded bg-slate-200"></div>
                    <div className="h-4 w-32 rounded bg-slate-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-20 rounded-full bg-slate-200"></div>
                    <div className="h-8 w-16 rounded-md bg-slate-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
