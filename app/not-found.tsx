import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-center px-4">
      <h1 className="text-[120px] font-black leading-none text-slate-900 select-none">404</h1>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-violet-400 mb-2">
          Signal Lost
        </h2>
        <p className="text-slate-400 max-w-md mb-8">
          Looks like this page got load-shedded or went up in smoke. 
          Double check the URL or head back to the station.
        </p>
        <Link 
          href="/"
          className="rounded-full bg-violet-600 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500 hover:scale-105"
        >
          Return to Base
        </Link>
      </div>
    </div>
  )
}
