// Phase-2-scoped loading skeleton for the sn- listing/search pages (colleges,
// schools, programs). Kept separate from components/ui/DirectorySkeleton,
// which admissions/loading.tsx still uses — that page isn't converted yet.
export default function ListingSkeleton({ title = 'Loading…', withSidebar = false }: { title?: string; withSidebar?: boolean }) {
  const cards = (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface">
          <div className="h-28 animate-pulse bg-sn-surface-alt" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-sn-surface-alt" />
            <div className="h-3 w-full animate-pulse rounded bg-sn-surface-alt" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-sn-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <div className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <div className="h-3 w-28 animate-pulse rounded bg-sn-primary-bg" />
          <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-xl bg-sn-surface-alt" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-sn-surface-alt" />
          <span className="sr-only">{title}</span>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8 lg:px-12">
        {withSidebar ? (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="hidden rounded-sn-card border border-sn-border bg-sn-surface p-5 lg:block">
              <div className="h-5 w-24 animate-pulse rounded bg-sn-surface-alt" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-sn-control bg-sn-surface-alt" />)}
              </div>
            </div>
            {cards}
          </div>
        ) : (
          <>
            <div className="mb-5 h-12 w-full max-w-xl animate-pulse rounded-sn-control bg-sn-surface" />
            <div className="mb-5 h-16 w-full animate-pulse rounded-sn-card bg-sn-surface" />
            {cards}
          </>
        )}
      </div>
    </div>
  )
}
