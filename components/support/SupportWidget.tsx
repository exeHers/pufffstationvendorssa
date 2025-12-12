'use client'

export default function SupportWidget() {
  // TODO: Put your cousin’s WhatsApp number here (international format, no +)
  // Example: 27821234567
  const whatsappNumber = '27820000000'

  const message = encodeURIComponent(
    "Howzit! I wanna place an order / ask about stock 🤝"
  )

  const href = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-[60] group"
      aria-label="Customer support on WhatsApp"
      title="Customer support"
    >
      <div className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition hover:bg-emerald-500/20 hover:border-emerald-300/50">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>

          <div className="leading-tight">
            <p className="text-xs font-semibold text-emerald-100">
              Need help, my bru?
            </p>
            <p className="text-[11px] text-emerald-100/70">
              Tap for support
            </p>
          </div>

          <span className="text-emerald-200/80 text-sm transition group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </a>
  )
}