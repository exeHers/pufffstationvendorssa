'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X, Navigation, AlertTriangle } from 'lucide-react'

// Mock fallback
const MOCK_LOCKERS = [
  { id: '1', name: 'Sandton City Locker', address: '83 Rivonia Rd, Sandhurst, Sandton', lat: -26.1076, lng: 28.0567 },
]

export default function PudoSelector({ 
  onSelect, 
  onClose 
}: { 
  onSelect: (locker: any) => void, 
  onClose: () => void 
}) {
  const [search, setSearch] = useState('')
  const [lockers, setLockers] = useState<any[]>([])
  const [filteredLockers, setFilteredLockers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    fetchAllLockers()
  }, [])

  const fetchAllLockers = async () => {
    setLoading(true)
    try {
      // Fetch all lockers (which now comes from the bundled JSON or API)
      const res = await fetch('/api/pudo/lockers?all=true')
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      const resultList = Array.isArray(data) ? data : (data.data || [])
      
      const normalized = resultList.map((l: any) => ({
        id: l.id || Math.random().toString(),
        name: l.name || l.description || 'Unknown Locker',
        address: l.address || l.location || '',
        lat: parseFloat(l.latitude || l.lat),
        lng: parseFloat(l.longitude || l.lng || l.lon || l.long)
      })).filter((l: any) => !isNaN(l.lat) && !isNaN(l.lng))

      setLockers(normalized)
      setFilteredLockers(normalized.slice(0, 50)) // Show first 50 initially
    } catch (e) {
      console.error(e)
      setError(true)
      setLockers(MOCK_LOCKERS)
      setFilteredLockers(MOCK_LOCKERS)
    } finally {
      setLoading(false)
    }
  }

  // Filter logic
  useEffect(() => {
    if (!search.trim()) {
      setFilteredLockers(lockers.slice(0, 50))
      return
    }

    const term = search.toLowerCase()
    const filtered = lockers.filter(l => 
      l.name.toLowerCase().includes(term) || 
      l.address.toLowerCase().includes(term)
    ).slice(0, 50) // Limit results for performance

    setFilteredLockers(filtered)
  }, [search, lockers])

  if (!hasMounted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-[80vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Navigation size={18} className="text-cyan-400" />
              Select PUDO Locker
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              {loading ? 'Loading units...' : `${lockers.length} active units`}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="group p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <X size={24} className="text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={18} />
            </div>
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by suburb, city or locker name..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-4 pl-12 pr-4 text-sm text-white outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-xs uppercase tracking-widest">Syncing Locker Network...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-amber-500 gap-3">
              <AlertTriangle size={24} />
              <p className="text-xs uppercase tracking-widest">Network Error. Using Offline Mode.</p>
            </div>
          ) : filteredLockers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No lockers found matching "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLockers.map(locker => (
                <button
                  key={locker.id}
                  onClick={() => onSelect(locker)}
                  className="w-full text-left p-4 rounded-xl border border-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                        {locker.name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-snug">
                        {locker.address}
                      </p>
                    </div>
                    <MapPin size={16} className="text-slate-600 group-hover:text-cyan-500 shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                PUDO Logistics Network
            </p>
        </div>
      </div>
    </div>
  )
}
