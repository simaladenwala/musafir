'use client'

import type { Neighborhood } from '@/lib/types'

const MEDALS = ['🥇', '🥈', '🥉']
const TITLES = ['Top Pick', 'Great Choice', 'Good Option']
const MEDAL_BG = ['bg-emerald-50 border-emerald-200', 'bg-sky-50 border-sky-200', 'bg-violet-50 border-violet-200']
const BADGE_STYLE = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
]

export default function NeighborhoodSuggestions({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[]
}) {
  if (neighborhoods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
        <span className="text-3xl">🏘️</span>
        <span className="text-sm">Not enough data to suggest areas</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">Best areas to live</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Ranked by density of masjids, halal meat shops &amp; restaurants
        </p>
      </div>

      {neighborhoods.map((n, i) => (
        <div
          key={i}
          className={`border rounded-xl p-4 ${MEDAL_BG[i]}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MEDALS[i]}</span>
              <span className="font-bold text-gray-800">{TITLES[i]}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${BADGE_STYLE[i]}`}>
              Score: {n.score}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-white/70 rounded-lg py-2">
              <div className="text-xl">🕌</div>
              <div className="text-lg font-bold text-emerald-700 leading-none mt-0.5">
                {n.masjidCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Masjids</div>
            </div>
            <div className="text-center bg-white/70 rounded-lg py-2">
              <div className="text-xl">🍽️</div>
              <div className="text-lg font-bold text-amber-600 leading-none mt-0.5">
                {n.restaurantCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Restaurants</div>
            </div>
            <div className="text-center bg-white/70 rounded-lg py-2">
              <div className="text-xl">🥩</div>
              <div className="text-lg font-bold text-red-600 leading-none mt-0.5">
                {n.meatShopCount}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Meat Shops</div>
            </div>
          </div>

          {/* Nearby places */}
          {n.nearbyPlaces.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1.5">Nearby:</div>
              <div className="flex flex-wrap gap-1">
                {n.nearbyPlaces.map((name, j) => (
                  <span
                    key={j}
                    className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <p className="text-xs text-emerald-800">
          <strong>💡 Tip:</strong> Look for apartments within a 5-minute drive of the top-scored
          masjid for easier Fajr and Isha prayers.
        </p>
      </div>
    </div>
  )
}
