'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { APIProvider } from '@vis.gl/react-google-maps'
import Map from '@/components/Map'
import PlacesList from '@/components/PlacesList'
import NeighborhoodSuggestions from '@/components/NeighborhoodSuggestions'
import type { SearchResult, Place, PlaceType } from '@/lib/types'

type Tab = PlaceType | 'neighborhoods'

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'masjid', label: 'Masjids', emoji: '🕌' },
  { key: 'halal_restaurant', label: 'Eats', emoji: '🍽️' },
  { key: 'halal_meat', label: 'Meat', emoji: '🥩' },
  { key: 'neighborhoods', label: 'Areas', emoji: '🏘️' },
]

function DashboardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [inputCity, setInputCity] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('masjid')
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(['masjid', 'halal_restaurant', 'halal_meat'])
  )
  const [showText, setShowText] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)
  const [showSubscribe, setShowSubscribe] = useState(false)

  function toggleType(type: string) {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const TYPE_FILTERS = [
    { key: 'masjid', label: 'Masjids', emoji: '🕌', activeColor: 'bg-emerald-100 text-emerald-700' },
    { key: 'halal_restaurant', label: 'Eats', emoji: '🍽️', activeColor: 'bg-amber-100 text-amber-700' },
    { key: 'halal_meat', label: 'Meat', emoji: '🥩', activeColor: 'bg-red-100 text-red-700' },
  ]

  const cityParam = searchParams.get('city') ?? ''

  useEffect(() => {
    if (cityParam) {
      setInputCity(cityParam)
      fetchPlaces(cityParam)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityParam])

  async function fetchPlaces(city: string) {
    setLoading(true)
    setError('')
    setSelectedPlace(null)
    try {
      const res = await fetch(`/api/places?city=${encodeURIComponent(city)}`)
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Something went wrong')
      }
      const data: SearchResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const city = inputCity.trim()
    if (!city) return
    router.push(`/dashboard?city=${encodeURIComponent(city)}`)
  }

  const filteredPlaces =
    result?.places.filter(p => p.type === (activeTab as PlaceType)) ?? []

  const countFor = (t: Tab) =>
    t === 'neighborhoods'
      ? result?.neighborhoods.length ?? 0
      : result?.places.filter(p => p.type === t).length ?? 0

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-2 md:gap-4 px-3 md:px-5 py-3 bg-emerald-800 text-white shadow-lg flex-shrink-0">
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span>🕌</span>
          <span className="hidden sm:inline">Musafir</span>
        </a>

        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
            placeholder="Search another city…"
            className="flex-1 px-4 py-1.5 rounded-lg bg-emerald-700 text-white placeholder-emerald-300 text-sm focus:outline-none focus:bg-emerald-600 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-white text-emerald-800 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Go
          </button>
        </form>

        {result && (
          <span className="text-emerald-300 text-sm hidden md:block truncate max-w-xs">
            {result.cityName}
          </span>
        )}
      </header>

      {/* Body */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding halal spots in {cityParam}…</p>
            <p className="text-gray-400 text-sm mt-1">Searching masjids, restaurants &amp; meat shops</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => cityParam && fetchPlaces(cityParam)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-6xl mb-3">🕌</div>
            <p className="text-gray-500 font-medium">Search a city above to get started</p>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile view toggle */}
          <div className="flex md:hidden border-b border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={() => setMobileView('map')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileView === 'map'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-500'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileView === 'list'
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-gray-500'
              }`}
            >
              📋 List
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 xl:w-96 flex-col bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden`}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setSelectedPlace(null)
                  }}
                  className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-emerald-600 text-emerald-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className="text-gray-400 font-normal">({countFor(tab.key)})</span>
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'neighborhoods' ? (
                <NeighborhoodSuggestions neighborhoods={result.neighborhoods} />
              ) : (
                <PlacesList
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                />
              )}
            </div>
          </aside>

          {/* Map */}
          <div className={`${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
            {/* Filter bar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0 flex-wrap">
              {/* Type filters */}
              <div className="flex items-center gap-1">
                {TYPE_FILTERS.map(f => {
                  const active = visibleTypes.has(f.key)
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleType(f.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active ? f.activeColor : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <span>{f.emoji}</span>
                      <span>{f.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Display toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowText(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    showText ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  🏷️ Text
                </button>
                <button
                  onClick={() => setShowPhoto(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    showPhoto ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  🖼️ Photo
                </button>
              </div>

              {/* Subscribe button */}
              <button
                onClick={() => setShowSubscribe(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex-shrink-0"
              >
                ✉️ Subscribe
              </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
                <Map
                  places={result.places}
                  cityCenter={result.cityCenter}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                  neighborhoods={result.neighborhoods}
                  showNeighborhoods={activeTab === 'neighborhoods'}
                  visibleTypes={visibleTypes}
                  showText={showText}
                  showPhoto={showPhoto}
                />
              </APIProvider>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Subscribe modal */}
      {showSubscribe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowSubscribe(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSubscribe(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
            <div className="text-2xl mb-1">✉️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Stay in the loop</h2>
            <p className="text-sm text-gray-500 mb-4">Get updates on new cities and features for Muslim travelers.</p>
            <iframe
              src="https://embeds.beehiiv.com/9539f830-2800-4ecb-9af0-d904ef06e703"
              data-test-id="beehiiv-embed"
              width="100%"
              height="320"
              style={{ borderRadius: 8, border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}
