'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, MapPin, X, Navigation, Loader2 } from 'lucide-react'

// Expanded Mock data for fallback/demo
const MOCK_LOCKERS = [
  { id: '1', name: 'Sandton City Locker', address: '83 Rivonia Rd, Sandhurst, Sandton', lat: -26.1076, lng: 28.0567 },
  { id: '2', name: 'Cape Town V&A Waterfront', address: '19 Dock Rd, Cape Town', lat: -33.9036, lng: 18.4201 },
  { id: '3', name: 'Umhlanga Arch Locker', address: '1 N Coast Rd, Umhlanga', lat: -29.7262, lng: 31.0858 },
  { id: '4', name: 'Menlyn Maine Locker', address: 'January Masilela Rd, Pretoria', lat: -25.7821, lng: 28.2811 },
  { id: '5', name: 'Gateway Theatre of Shopping', address: '1 Palm Blvd, Umhlanga Ridge', lat: -29.7258, lng: 31.0660 },
  { id: '6', name: 'Mall of Africa', address: 'Magwa Cres, Midrand', lat: -26.0151, lng: 28.1065 },
  { id: '7', name: 'Rosebank Mall', address: '50 Bath Ave, Rosebank, Johannesburg', lat: -26.1458, lng: 28.0431 },
  { id: '8', name: 'Canal Walk Shopping Centre', address: 'Century Blvd, Century City, Cape Town', lat: -33.8927, lng: 18.5122 },
  { id: '9', name: 'Pavilion Shopping Centre', address: 'Jack Martens Dr, Dawncliffe, Westville', lat: -29.8517, lng: 30.9348 },
  { id: '10', name: 'Brooklyn Mall', address: 'Veale St, Nieuw Muckleneuk, Pretoria', lat: -25.7719, lng: 28.2346 },
]

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function PudoMap({ 
  onSelect, 
  onClose 
}: { 
  onSelect: (locker: any) => void, 
  onClose: () => void 
}) {
  const [center, setCenter] = useState<[number, number]>([-26.1076, 28.0567]) // Default to Sandton
  const [zoom, setZoom] = useState(12)
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    // Fix for Leaflet icons in Next.js
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
    }
  }, [])

  const filteredLockers = useMemo(() => {
    if (!search || search.length < 2) return MOCK_LOCKERS
    const q = search.toLowerCase()
    const filtered = MOCK_LOCKERS.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.address.toLowerCase().includes(q)
    )
    return filtered.length > 0 ? filtered : MOCK_LOCKERS
  }, [search])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return

    setIsSearching(true)
    try {
      // Use free Nominatim API to find coordinates for the search string
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + ', South Africa')}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setCenter([parseFloat(lat), parseFloat(lon)])
        setZoom(14)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }

  if (!hasMounted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full h-full sm:max-w-5xl sm:h-[85vh] bg-slate-950 border-0 sm:border sm:border-slate-800 sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Navigation size={18} className="text-violet-500" />
              PUDO Locker Terminal
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Select your collection point</p>
          </div>
          <button 
            onClick={onClose} 
            className="group p-3 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <X size={24} className="text-slate-400 group-hover:text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 relative z-10">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
              {isSearching ? (
                <Loader2 className="text-violet-500 animate-spin" size={18} />
              ) : (
                <Search className="text-slate-500" size={18} />
              )}
            </div>
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suburb or city (e.g. Sandton, Durban)..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase px-4 py-2 rounded-xl hover:bg-violet-500 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-950">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={true} 
            className="h-full w-full"
            zoomControl={false}
          >
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLockers.map(locker => (
              <Marker key={locker.id} position={[locker.lat, locker.lng]}>
                <Popup className="custom-popup" closeButton={false} offset={[0, -10]}>
                  <div className="p-3 min-w-[200px]">
                    <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Available Locker</div>
                    <h4 className="font-bold text-white text-sm mb-1">{locker.name}</h4>
                    <p className="text-[11px] text-slate-400 mb-4 leading-snug">{locker.address}</p>
                    <button 
                      onClick={() => onSelect(locker)}
                      className="w-full bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-violet-500 active:scale-95 transition-all shadow-lg shadow-violet-600/20"
                    >
                      Use This Locker
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* List Overlay (Nearby results) */}
          <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-[1000]">
             <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 pointer-events-auto shadow-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {search ? `Results for "${search}"` : 'Quick Select'} ({filteredLockers.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {filteredLockers.slice(0, 5).map(l => (
                    <button 
                      key={l.id}
                      onClick={() => {
                        setCenter([l.lat, l.lng])
                        setZoom(15)
                      }}
                      className="shrink-0 bg-slate-950 border border-slate-800 p-3 rounded-xl text-left hover:border-violet-500/50 transition-colors"
                    >
                      <p className="text-[11px] font-bold text-white truncate w-32">{l.name}</p>
                      <p className="text-[9px] text-slate-500 truncate w-32">Select on map</p>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6">
          <p className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase tracking-widest">
            <MapPin size={12} className="text-violet-500" />
            Terminal active · {filteredLockers.length} locations
          </p>
          <div className="hidden sm:block text-[9px] text-slate-600 uppercase font-black">
            PUFFF LOGISTICS SECURE
          </div>
        </div>
      </div>
    </div>
  )
}
