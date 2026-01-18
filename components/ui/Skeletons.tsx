'use client'

import { motion } from 'framer-motion'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900/50 ${className}`}>
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/[0.04] bg-slate-950/40 p-5">
      <Skeleton className="aspect-square w-full rounded-2xl bg-black/40" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-1/4 rounded-full" />
          <Skeleton className="h-8 w-1/3 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ShopSkeleton() {
  return (
    <div className="space-y-10">
      {/* Featured Hero Skeleton */}
      <Skeleton className="h-[400px] w-full rounded-[2.25rem]" />

      {/* Rows */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="hidden h-4 w-12 sm:block" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="min-w-[270px] sm:min-w-[320px]">
                <ProductSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
