export default function Marquee() {
  const items = [
    '[!] FRESH DROPS',
    'NO ESKOM PROMISES',
    '24H DISPATCH',
    'VENDORS ONLY',
    'CLEAN STOCK',
    'MAXIMUM FLAVOR',
  ]

  const sequence = [...items, ...items, ...items, ...items]

  return (
    <div className="relative z-50 overflow-hidden border-y border-cyan-500/20 bg-slate-900 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100/85 leading-none sm:text-xs sm:tracking-widest sm:text-cyan-100">
      <div className="marquee-track flex items-center whitespace-nowrap animate-marquee">
        {sequence.map((item, index) => (
          <span key={`m-${index}`} className="mx-3 sm:mx-4">
            {item} {' | '}
          </span>
        ))}
      </div>
    </div>
  )
}
