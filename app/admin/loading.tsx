export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-7xl animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 h-8 w-48 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-64 rounded bg-slate-200"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 rounded-lg bg-slate-200"></div>
            <div className="h-10 w-24 rounded-lg bg-slate-200"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100"></div>
                <div>
                  <div className="mb-2 h-4 w-24 rounded bg-slate-200"></div>
                  <div className="h-6 w-16 rounded bg-slate-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts / Table Layout Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Top Majors Skeleton */}
          <div className="col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="h-5 w-32 rounded bg-slate-200"></div>
            </div>
            <div className="p-6 space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                  </div>
                  <div className="h-5 w-12 rounded-full bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Students Table Skeleton */}
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="h-5 w-48 rounded bg-slate-200"></div>
              <div className="h-4 w-24 rounded bg-slate-200"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-50 pb-4"
                >
                  <div className="flex gap-8">
                    <div className="h-4 w-20 rounded bg-slate-200"></div>
                    <div className="h-4 w-32 rounded bg-slate-200"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-24 rounded-md bg-slate-200"></div>
                    <div className="h-6 w-16 rounded-md bg-slate-200"></div>
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
