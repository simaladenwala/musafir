'use client'

import PlaceCard from './PlaceCard'
import type { Place } from '@/lib/types'

export default function PlacesList({
  places,
  selectedPlace,
  onSelectPlace,
}: {
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (p: Place | null) => void
}) {
  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
        <span className="text-3xl">🔍</span>
        <span className="text-sm">No results found</span>
      </div>
    )
  }

  const sorted = [...places].sort((a, b) => a.distance - b.distance)

  return (
    <div className="divide-y divide-gray-100">
      {sorted.map(place => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedPlace?.id === place.id}
          onClick={() => onSelectPlace(selectedPlace?.id === place.id ? null : place)}
        />
      ))}
    </div>
  )
}
