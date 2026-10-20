export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-2 h-8 w-32 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-64 rounded bg-slate-200"></div>
        </div>

        {/* Form Inputs Skeleton */}
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 h-4 w-16 rounded bg-slate-200"></div>
            <div className="h-10 w-full rounded-lg bg-slate-100"></div>
          </div>
          <div>
            <div className="mb-1.5 h-4 w-20 rounded bg-slate-200"></div>
            <div className="h-10 w-full rounded-lg bg-slate-100"></div>
          </div>

          {/* Button Skeleton */}
          <div className="h-10 w-full rounded-lg bg-slate-200"></div>
        </div>

        {/* OR Divider Skeleton */}
        <div className="my-6 flex items-center justify-center">
          <div className="h-px w-full bg-slate-200"></div>
          <div className="mx-4 h-3 w-8 rounded bg-slate-200"></div>
          <div className="h-px w-full bg-slate-200"></div>
        </div>

        {/* OAuth Button Skeleton */}
        <div className="h-10 w-full rounded-lg bg-slate-100 border border-slate-200"></div>
      </div>
    </div>
  );
}
