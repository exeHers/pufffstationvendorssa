import { supabase } from '@/lib/supabaseClient'

export default async function ReviewFeed() {
  const [reviewsRes, configRes] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('settings')
      .select('*')
      .eq('key', 'review_config')
      .single()
  ])

  const reviews = reviewsRes.data || []
  const config = configRes.data?.value || {
    header_title: 'Wall of PUFFF',
    header_subtitle: 'Vendor Feedback',
    accent_color: '#D946EF',
    card_blur: true
  }

  if (!reviews || reviews.length === 0) return null

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 mt-16">
      <div 
        className={`mb-10 text-center rounded-[2.5rem] bg-slate-900/40 border border-white/[0.04] py-8 ${config.card_blur ? 'backdrop-blur-md' : ''} max-w-2xl mx-auto shadow-2xl`}
      >
        <p 
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: config.accent_color }}
        >
          {config.header_title}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white uppercase tracking-tighter sm:text-3xl">
          {config.header_subtitle}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-12">
        {reviews.map((r: any) => (
          <div 
            key={r.id} 
            className={`rounded-[2rem] border border-white/[0.04] bg-slate-950/60 p-6 ${config.card_blur ? 'backdrop-blur-lg' : ''} transition hover:border-[var(--hb)] hover:shadow-2xl`}
            style={{
              ['--hb' as any]: `${config.accent_color}33`, // border color with alpha
            } as React.CSSProperties}
          >
            <div className="flex gap-0.5 text-[10px] mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span 
                  key={s} 
                  className={s <= r.rating ? 'opacity-100' : 'opacity-20 text-slate-400'}
                  style={{ color: s <= r.rating ? config.accent_color : undefined }}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic mb-4">"{r.text || 'Lekker drops.'}"</p>
            <div className="flex items-center gap-2 border-t border-white/[0.03] pt-4">
               <div 
                 className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                 style={{ background: `linear-gradient(to bottom right, ${config.accent_color}, #000)` }}
               >
                  {r.customer_name?.[0]?.toUpperCase() || 'P'}
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.customer_name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
