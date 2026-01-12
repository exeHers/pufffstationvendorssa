import { ShopSkeleton } from '@/components/ui/Skeletons'

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div className="space-y-3">
          <div className="h-4 w-12 rounded bg-slate-900 animate-pulse" />
          <div className="h-10 w-64 rounded bg-slate-900 animate-pulse" />
          <div className="h-4 w-96 rounded bg-slate-900 animate-pulse" />
        </div>
        <div className="flex gap-3">
           <div className="h-12 w-48 rounded-2xl bg-slate-900 animate-pulse" />
           <div className="h-12 w-48 rounded-2xl bg-slate-900 animate-pulse" />
        </div>
      </div>
      <ShopSkeleton />
    </main>
  )
}
