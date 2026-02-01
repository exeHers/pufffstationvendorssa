'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabaseBrowser } from '@/lib/supabase/browser'
import PulseTab from '@/components/admin/PulseTab'
import QuickActionsTab from '@/components/admin/QuickActionsTab'
import QuickAddPanel from '@/components/admin/QuickAddPanel'
import FeaturedDropsSettings from '@/components/admin/FeaturedDropsSettings'

export default function AdminClient() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('...')

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email)
    })
  }, [])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-16 pt-8">
      <header className="flex flex-col gap-3 border-b border-slate-800/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.5, 1, 0.5] 
               }}
               transition={{ 
                 duration: 2, 
                 repeat: Infinity, 
                 ease: "easeInOut" 
               }}
               className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" 
             />
             <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">
               PUFFF Admin Panel
             </p>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            Operational Hub
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Authorized: <span className="text-slate-300 ml-1">{email || '...'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/shop"
            className="w-full rounded-full border border-white/[0.05] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-violet-500/50 hover:text-violet-400 sm:w-auto"
          >
            Live Shop
          </Link>

          <Link
            href="/logout"
            className="w-full rounded-full bg-slate-900 border border-slate-800 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:border-red-400 hover:text-red-200 sm:w-auto"
          >
            Terminal Out
          </Link>
        </div>
      </header>

      <Suspense fallback={<div>Loading Tabs...</div>}>
        <AdminTabs />
      </Suspense>
    </main>
  )
}

function AdminTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'management'
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 rounded-[2rem] border border-slate-800/60 bg-slate-950/40 p-1.5 w-fit">
        {[
          { id: 'management', label: 'Management' },
          { id: 'pulse', label: 'Pulse' },
          { id: 'actions', label: 'Quick Actions' },
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`rounded-full px-6 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
               activeTab === tab.id
                 ? 'bg-violet-600 text-white shadow-lg'
                 : 'text-slate-500 hover:text-slate-300'
             }`}
           >
             {tab.label}
           </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'management' && (
          <motion.section
            key="management"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <FeaturedDropsSettings />
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminCard title="Inventory" desc="Vape stocks & visual FX." href="/admin/products" icon="📦" />
              <AdminCard title="Spotlight" desc="Featured home drops." href="/admin/featured-drops" icon="🌟" />
              <AdminCard title="Order Flow" desc="Shipping & logistics." href="/admin/orders" icon="🚚" />
              <AdminCard title="Brand DNA" desc="Categories & identity." href="/admin/categories" icon="💎" />
              <AdminCard title="Palette" desc="Flavour filter tags." href="/admin/flavours" icon="🍭" />
              <AdminCard title="Support" desc="Customer terminal." href="/admin/support" icon="✉️" />
            </div>
          </motion.section>
        )}

        {activeTab === 'pulse' && (
          <motion.section
            key="pulse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PulseTab />
          </motion.section>
        )}

        {activeTab === 'actions' && (
          <motion.section
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuickActionsTab onOpenQuickAdd={() => setQuickAddOpen(true)} />
          </motion.section>
        )}
      </AnimatePresence>

      <QuickAddPanel
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  )
}

function AdminCard({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[2rem] border border-white/[0.04] bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-violet-500/30"
    >
      <div className="absolute -right-4 -top-4 text-5xl opacity-[0.02] transition-all duration-500 group-hover:scale-125 group-hover:opacity-[0.05] grayscale">
        {icon}
      </div>
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <div className="mb-3 text-2xl">{icon}</div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white transition duration-300 group-hover:text-violet-400">
            {title}
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-300">
            {desc}
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 transition duration-300 group-hover:border-violet-500/50 group-hover:text-white">
          Enter
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  )
}
