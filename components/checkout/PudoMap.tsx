'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Search, MapPin, X, Navigation, Loader2, AlertTriangle } from 'lucide-react'

// Mock fallback in case API fails entirely or for initial load if needed
const MOCK_LOCKERS = [
  { id: '1', name: 'Sandton City Locker', address: '83 Rivonia Rd, Sandhurst, Sandton', lat: -26.1076, lng: 28.0567 },
]

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function MapEvents({ onChange }: { onChange: (map: L.Map) => void }) {
  const map = useMapEvents({
    zoomend: () => onChange(map),
    moveend: () => onChange(map),
  })

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
  const [showAll, setShowAll] = useState(true)
  const [useClustering, setUseClustering] = useState(true)
  const [mapRef, setMapRef] = useState<L.Map | null>(null)
  const [mapZoom, setMapZoom] = useState(12)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  const fetchNearbyRef = useRef<number | null>(null)
  
  // Real locker state
  const [lockers, setLockers] = useState<any[]>([])
  const [loadingLockers, setLoadingLockers] = useState(false)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    if (typeof window !== 'undefined') {
      // Fix for Leaflet icons in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
    }
  }, [])

  const didRefreshAllRef = useRef(false)

  // Fetch all lockers (full dataset)
  const fetchAllLockers = useCallback(async () => {
    setLoadingLockers(true)
    setApiError(false)
    try {
      const refreshParam = didRefreshAllRef.current ? '' : '&refresh=true'
      const res = await fetch(`/api/pudo/lockers?all=true${refreshParam}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      
      // Pudo API usually returns an array or an object with a 'data' property
      // We'll handle both cases to be safe
      const resultList = Array.isArray(data) ? data : (data.data || [])
      
      // Normalize data structure if needed
      const normalized = resultList.map((l: any) => ({
        id: l.id || Math.random().toString(),
        name: l.name || l.description || 'Unknown Locker',
        address: l.address || l.location || '',
        lat: parseFloat(l.latitude || l.lat),
        lng: parseFloat(l.longitude || l.lng || l.lon || l.long) // Handle 'lon' or 'lng'
      })).filter((l: any) => !isNaN(l.lat) && !isNaN(l.lng))

      if (normalized.length > 0) {
        didRefreshAllRef.current = true
        setLockers(normalized)
      } else {
        setLockers([])
      }
    } catch (e) {
      console.error(e)
      setApiError(true)
      // Fallback to mocks if initial load fails
      setLockers((prev) => (prev.length === 0 ? MOCK_LOCKERS : prev))
    } finally {
      setLoadingLockers(false)
    }
  }, [])

  const fetchNearbyLockers = useCallback(async (lat: number, lng: number) => {
    setLoadingLockers(true)
    setApiError(false)
    try {
      const res = await fetch(`/api/pudo/lockers?lat=${lat}&lng=${lng}`)
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

      if (normalized.length > 0) setLockers(normalized)
      else setLockers([])
    } catch (e) {
      console.error(e)
      setApiError(true)
      setLockers((prev) => (prev.length === 0 ? MOCK_LOCKERS : prev))
    } finally {
      setLoadingLockers(false)
    }
  }, [])

  // Initial fetch on mount (Sandton default)
  useEffect(() => {
    if (hasMounted) {
      if (showAll) fetchAllLockers()
      else fetchNearbyLockers(center[0], center[1])
    }
  }, [hasMounted, fetchAllLockers, fetchNearbyLockers, showAll, center])

  // Refetch nearby when center changes
  useEffect(() => {
    if (!hasMounted || showAll) return
    if (fetchNearbyRef.current) window.clearTimeout(fetchNearbyRef.current)
    fetchNearbyRef.current = window.setTimeout(() => {
      fetchNearbyLockers(center[0], center[1])
    }, 350)
    return () => {
      if (fetchNearbyRef.current) window.clearTimeout(fetchNearbyRef.current)
    }
  }, [center, showAll, hasMounted, fetchNearbyLockers])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return

    setIsSearching(true)
    try {
      // 1. Find coordinates for the city name
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search + ', South Africa')}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)
        
        // 2. Move map
        setCenter([newLat, newLng])
        setZoom(13)

        // 3. Keep all lockers, just re-center (or re-fetch if nearby-only)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const visibleLockers = useMemo(() => {
    if (!mapBounds) return lockers
    const padded = mapBounds.pad(0.2)
    return lockers.filter((l) => padded.contains([l.lat, l.lng]))
  }, [lockers, mapBounds])

  const handleMapChange = useCallback((map: L.Map) => {
    setMapRef(map)
    setMapZoom(map.getZoom())
    setMapBounds(map.getBounds())
  }, [])

  const clustered = useMemo(() => {
    if (!mapRef || !useClustering || visibleLockers.length < 50) {
      return { clusters: [], singles: visibleLockers }
    }

    const gridPx = mapZoom <= 11 ? 70 : mapZoom <= 13 ? 60 : 50
    const buckets = new Map<string, { latSum: number; lngSum: number; count: number; items: any[] }>()

    for (const l of visibleLockers) {
      const p = mapRef.project([l.lat, l.lng], mapZoom)
      const key = `${Math.floor(p.x / gridPx)}:${Math.floor(p.y / gridPx)}`
      const bucket = buckets.get(key)
      if (bucket) {
        bucket.latSum += l.lat
        bucket.lngSum += l.lng
        bucket.count += 1
        bucket.items.push(l)
      } else {
        buckets.set(key, { latSum: l.lat, lngSum: l.lng, count: 1, items: [l] })
      }
    }

    const clusters: { lat: number; lng: number; count: number; items: any[] }[] = []
    const singles: any[] = []

    buckets.forEach((b) => {
      if (b.count === 1) {
        singles.push(b.items[0])
      } else {
        clusters.push({
          lat: b.latSum / b.count,
          lng: b.lngSum / b.count,
          count: b.count,
          items: b.items
        })
      }
    })

    return { clusters, singles }
  }, [mapRef, mapZoom, useClustering, visibleLockers])

  const clusterIcon = useCallback((count: number) => {
    return L.divIcon({
      className: 'pudo-cluster-icon',
      html: `<div class="pudo-cluster-pill">${count}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })
  }, [])

  if (!hasMounted) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full h-full sm:max-w-5xl sm:h-[85vh] bg-slate-950 border-0 sm:border sm:border-slate-800 sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Navigation size={18} className="text-cyan-400" />
              PUDO Locker Terminal
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              {loadingLockers
                ? 'Scanning sector...'
                : showAll
                  ? `${lockers.length} active units loaded`
                  : `${lockers.length} nearest units`}
            </p>
            {lockers.length < 500 && (
              <p className="mt-2 text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold">
                Locker list incomplete. Upload full list in Admin - PUDO.
              </p>
            )}
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
                <Loader2 className="text-cyan-400 animate-spin" size={18} />
              ) : (
                <Search className="text-slate-500" size={18} />
              )}
            </div>
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suburb or city (e.g. Sandton)..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 py-4 pl-12 pr-4 text-sm text-white outline-none transition-all shadow-inner focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-600 px-4 py-2 text-[10px] font-bold uppercase text-white transition-colors hover:bg-cyan-500"
            >
              Search
            </button>
          </form>

          <div className="mt-3 max-w-2xl mx-auto flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              Show all lockers (slow on mobile)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useClustering}
                onChange={(e) => setUseClustering(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              Cluster markers
            </label>
          </div>
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
            <MapEvents onChange={handleMapChange} />
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clustered.clusters.map((cluster) => (
              <Marker
                key={`cluster-${cluster.lat}-${cluster.lng}`}
                position={[cluster.lat, cluster.lng]}
                icon={clusterIcon(cluster.count)}
                eventHandlers={{
                  click: () => {
                    if (mapRef) {
                      mapRef.setView([cluster.lat, cluster.lng], Math.min(mapZoom + 2, 18))
                    }
                  }
                }}
              />
            ))}

            {clustered.singles.map(locker => (
              <Marker key={locker.id} position={[locker.lat, locker.lng]}>
                <Popup className="custom-popup" closeButton={false} offset={[0, -10]}>
                  <div className="p-3 min-w-[200px]">
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">Available Locker</div>
                    <h4 className="font-bold text-white text-sm mb-1">{locker.name}</h4>
                    <p className="text-[11px] text-slate-400 mb-4 leading-snug">{locker.address}</p>
                    <button 
                      onClick={() => onSelect(locker)}
                      className="w-full rounded-xl bg-cyan-600 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500 active:scale-95"
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
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {loadingLockers ? 'Syncing...' : 'Nearby Units'}
                  </p>
                  {apiError && <span className="text-[10px] text-amber-500 flex items-center gap-1"><AlertTriangle size={10}/> Data Feed Unstable</span>}
                </div>
                
            {lockers.length === 0 && !loadingLockers ? (
              <div className="text-center py-2">
                <p className="text-xs text-slate-400">No lockers found in this sector.</p>
                <p className="text-[10px] text-slate-600">Try searching for a larger city nearby.</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {visibleLockers.slice(0, 5).map(l => (
                      <button 
                        key={l.id}
                        onClick={() => {
                          setCenter([l.lat, l.lng])
                          setZoom(15)
                        }}
                        className="w-40 shrink-0 rounded-xl border border-slate-800 bg-slate-950 p-3 text-left transition-colors hover:border-cyan-500/50"
                      >
                        <p className="text-[11px] font-bold text-white truncate">{l.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">Select on map</p>
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6">
          <p className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase tracking-widest">
            <MapPin size={12} className="text-cyan-400" />
            Terminal active
          </p>
          <div className="hidden sm:block text-[9px] text-slate-600 uppercase font-black">
            PUFFF LOGISTICS SECURE
          </div>
        </div>
      </div>
    </div>
  )
}
