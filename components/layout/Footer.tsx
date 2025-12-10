export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-[11px] text-slate-500">
        
        <span className="opacity-80">
          PufffstationvendorsSA
        </span>

        <div className="flex items-center gap-3">
          <span className="opacity-50">
            Powered by Next.js & Supabase
          </span>

          <span className="opacity-80 font-semibold tracking-wide text-slate-300">
            DNVN Digital
          </span>
        </div>

      </div>
    </footer>
  )
}