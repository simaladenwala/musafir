'use client'

import { useState } from 'react'
import type { Place } from '@/lib/types'

const BORDER_COLOR: Record<string, string> = {
  masjid: 'border-l-emerald-500',
  halal_restaurant: 'border-l-amber-500',
  halal_meat: 'border-l-red-500',
}

export default function PlaceCard({
  place,
  isSelected,
  onClick,
}: {
  place: Place
  isSelected: boolean
  onClick: () => void
}) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [photoError, setPhotoError] = useState(false)

  const hasPhoto = place.photos.length > 0 && !photoError

  return (
    <div
      onClick={onClick}
      className={`border-l-4 ${BORDER_COLOR[place.type]} cursor-pointer transition-colors p-3 ${
        isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* Photo */}
      {hasPhoto && (
        <div className="relative h-36 rounded-lg overflow-hidden mb-3 bg-gray-100 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={place.photos[photoIndex]}
            src={`/api/photo?name=${encodeURIComponent(place.photos[photoIndex])}`}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => {
              if (photoIndex < place.photos.length - 1) {
                setPhotoIndex(i => i + 1)
              } else {
                setPhotoError(true)
              }
            }}
          />
          {place.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {place.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={e => {
                    e.stopPropagation()
                    setPhotoIndex(i)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === photoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Name */}
      <div className="font-semibold text-gray-800 text-sm leading-tight">{place.name}</div>

      {/* Address */}
      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{place.address}</div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {place.rating != null && (
          <span className="text-xs text-amber-600 font-medium">⭐ {place.rating}</span>
        )}
        <span className="text-xs text-gray-400">📍 {place.distance} mi</span>
        {place.isOpen === true && (
          <span className="text-xs text-emerald-600 font-semibold">Open now</span>
        )}
        {place.isOpen === false && (
          <span className="text-xs text-red-500">Closed</span>
        )}
      </div>

      {/* Links */}
      {(place.phone || place.website) && (
        <div className="flex gap-3 mt-2">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="text-xs text-blue-600 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              📞 Call
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              🌐 Website
            </a>
          )}
        </div>
      )}
    </div>
  )
}
