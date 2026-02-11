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
    <div className="relative z-50 overflow-hidden border-y border-cyan-500/20 bg-slate-900 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 leading-none">
      <div className="marquee-track flex items-center whitespace-nowrap animate-marquee">
        {sequence.map((item, index) => (
          <span key={`m-${index}`} className="mx-4">
            {item} {' | '}
          </span>
        ))}
      </div>
    </div>
  )
}
