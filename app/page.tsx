'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const QUICK_CITIES = [
  'Houston, TX',
  'Dearborn, MI',
  'New York, NY',
  'Chicago, IL',
  'Dallas, TX',
  'Los Angeles, CA',
  'Atlanta, GA',
  'Minneapolis, MN',
]

export default function HomePage() {
  const [city, setCity] = useState('')
  const router = useRouter()

  function go(c: string) {
    router.push(`/dashboard?city=${encodeURIComponent(c.trim())}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (city.trim()) go(city)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 flex items-center justify-center p-6">
      <div className="text-center w-full max-w-2xl">
        {/* Hero */}
        <div className="text-7xl mb-5 select-none">🕌</div>
        <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">Musafir</h1>
        <p className="text-emerald-300 text-2xl mb-3 font-light">مسافر</p>
        <p className="text-emerald-100 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Moving to a new city? Find masjids, halal food, and the perfect neighborhood — fast.
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto mb-10">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Enter a city (e.g. Houston, TX)"
            className="flex-1 px-5 py-4 text-base rounded-xl bg-white text-gray-800 placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-4 bg-white text-emerald-800 font-bold rounded-xl shadow-2xl hover:bg-emerald-50 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Feature tiles */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
          {[
            { icon: '🕌', title: 'Masjids', desc: 'Photos, hours & distance' },
            { icon: '🍽️', title: 'Halal Food', desc: 'Restaurants with ratings' },
            { icon: '🥩', title: 'Halal Meat', desc: 'Butchers & grocery shops' },
          ].map(f => (
            <div key={f.title} className="bg-white/10 backdrop-blur rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-1">{f.icon}</div>
              <div className="font-semibold text-sm">{f.title}</div>
              <div className="text-emerald-200 text-xs mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Quick cities */}
        <div>
          <p className="text-emerald-400 text-xs uppercase tracking-widest mb-3">Popular cities</p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_CITIES.map(c => (
              <button
                key={c}
                onClick={() => go(c)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm rounded-full transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
