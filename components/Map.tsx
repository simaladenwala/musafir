'use client'

import { useEffect, useState } from 'react'
import {
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import type { Place, Neighborhood } from '@/lib/types'

const TYPE_COLOR: Record<string, string> = {
  masjid: '#059669',
  halal_restaurant: '#d97706',
  halal_meat: '#dc2626',
}

const TYPE_ICON: Record<string, string> = {
  masjid: '🕌',
  halal_restaurant: '🍽️',
  halal_meat: '🥩',
}

const MEDALS = ['🥇', '🥈', '🥉']

interface MapProps {
  places: Place[]
  cityCenter: { lat: number; lng: number }
  selectedPlace: Place | null
  onSelectPlace: (p: Place | null) => void
  neighborhoods: Neighborhood[]
  showNeighborhoods: boolean
}

function MapController({
  center,
  zoom,
}: {
  center: google.maps.LatLngLiteral
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    if (map) {
      map.panTo(center)
      map.setZoom(zoom)
    }
  }, [map, center, zoom])
  return null
}

export default function Map({
  places,
  cityCenter,
  selectedPlace,
  onSelectPlace,
  neighborhoods,
  showNeighborhoods,
}: MapProps) {
  const mapCenter = selectedPlace
    ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
    : cityCenter
  const mapZoom = selectedPlace ? 16 : 11

  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(['masjid', 'halal_restaurant', 'halal_meat'])
  )
  const [showPhotos, setShowPhotos] = useState(true)

  function toggleType(type: string) {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const visiblePlaces = places.filter(p => visibleTypes.has(p.type))

  const TYPE_FILTERS = [
    { key: 'masjid', label: 'Masjids', emoji: '🕌' },
    { key: 'halal_restaurant', label: 'Eats', emoji: '🍽️' },
    { key: 'halal_meat', label: 'Meat', emoji: '🥩' },
  ]

  return (
    <GoogleMap
      mapId="musafir-map"
      defaultCenter={cityCenter}
      defaultZoom={11}
      gestureHandling="greedy"
      disableDefaultUI={false}
      style={{ width: '100%', height: '100%' }}
    >
      <MapController center={mapCenter} zoom={mapZoom} />

      {/* Filter controls */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Type toggles */}
        <div
          style={{
            background: 'white',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {TYPE_FILTERS.map(f => {
            const active = visibleTypes.has(f.key)
            return (
              <button
                key={f.key}
                onClick={() => toggleType(f.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? TYPE_COLOR[f.key] + '18' : '#f3f4f6',
                  color: active ? TYPE_COLOR[f.key] : '#9ca3af',
                  fontWeight: 600,
                  fontSize: 12,
                  transition: 'all 0.15s',
                  opacity: active ? 1 : 0.6,
                }}
              >
                <span style={{ fontSize: 14 }}>{f.emoji}</span>
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Photo toggle */}
        <button
          onClick={() => setShowPhotos(p => !p)}
          style={{
            background: 'white',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '6px 10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            color: showPhotos ? '#059669' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.15s',
          }}
        >
          {showPhotos ? '🖼️ Photos on' : '📍 Names only'}
        </button>
      </div>

      {/* Place markers */}
      {visiblePlaces.map(place => {
        const isSelected = selectedPlace?.id === place.id
        const photoUrl = place.photos[0]
          ? `/api/photo?name=${encodeURIComponent(place.photos[0])}`
          : null
        return (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => onSelectPlace(isSelected ? null : place)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              {/* Label card above pin */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 8,
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(5,150,105,0.5), 0 4px 12px rgba(0,0,0,0.2)'
                    : '0 2px 8px rgba(0,0,0,0.18)',
                  overflow: 'hidden',
                  width: 110,
                  marginBottom: 4,
                  border: isSelected ? `2px solid ${TYPE_COLOR[place.type]}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {showPhotos && photoUrl && (
                  <img
                    src={photoUrl}
                    alt={place.name}
                    style={{ width: '100%', height: 60, objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <div
                  style={{
                    padding: '3px 5px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#1f2937',
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }}
                >
                  {place.name.length > 22 ? place.name.slice(0, 22) + '…' : place.name}
                </div>
              </div>

              {/* Pin circle */}
              <div
                style={{
                  width: isSelected ? 36 : 28,
                  height: isSelected ? 36 : 28,
                  backgroundColor: TYPE_COLOR[place.type],
                  borderRadius: '50%',
                  border: '2.5px solid white',
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(5,150,105,0.4), 0 4px 12px rgba(0,0,0,0.3)'
                    : '0 2px 6px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSelected ? 18 : 14,
                  transition: 'all 0.15s',
                }}
              >
                {TYPE_ICON[place.type]}
              </div>
            </div>
          </AdvancedMarker>
        )
      })}

      {/* Info window for selected place */}
      {selectedPlace && (
        <InfoWindow
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onCloseClick={() => onSelectPlace(null)}
        >
          <div style={{ maxWidth: 220, fontFamily: 'inherit' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937', marginBottom: 4 }}>
              {selectedPlace.name}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 1.4 }}>
              {selectedPlace.address}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              {selectedPlace.rating && (
                <span style={{ color: '#d97706' }}>⭐ {selectedPlace.rating}</span>
              )}
              <span style={{ color: '#6b7280' }}>📍 {selectedPlace.distance} km</span>
              {selectedPlace.isOpen === true && (
                <span style={{ color: '#059669', fontWeight: 600 }}>Open</span>
              )}
              {selectedPlace.isOpen === false && (
                <span style={{ color: '#dc2626' }}>Closed</span>
              )}
            </div>
            {(selectedPlace.phone || selectedPlace.website) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {selectedPlace.phone && (
                  <a
                    href={`tel:${selectedPlace.phone}`}
                    style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}
                  >
                    📞 Call
                  </a>
                )}
                {selectedPlace.website && (
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}

      {/* Neighborhood markers */}
      {showNeighborhoods &&
        neighborhoods.map((n, i) => (
          <AdvancedMarker
            key={`neighborhood-${i}`}
            position={{ lat: n.lat, lng: n.lng }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px dashed rgba(16, 185, 129, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 22 }}>{MEDALS[i]}</span>
              <span
                style={{
                  fontSize: 9,
                  color: '#059669',
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                BEST AREA {i + 1}
              </span>
            </div>
          </AdvancedMarker>
        ))}
    </GoogleMap>
  )
}
