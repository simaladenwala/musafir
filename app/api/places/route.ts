import { NextRequest, NextResponse } from 'next/server'
import { haversineDistance, suggestNeighborhoods } from '@/lib/utils'
import type { Place, SearchResult } from '@/lib/types'

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText'
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.photos',
  'places.rating',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
].join(',')

async function searchPlaces(
  textQuery: string,
  center: { lat: number; lng: number }
): Promise<Omit<Place, 'type' | 'distance'>[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('Missing GOOGLE_MAPS_API_KEY')

  const res = await fetch(PLACES_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: 40000,
        },
      },
    }),
  })

  if (!res.ok) {
    console.error('Places API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.places || []).map((p: any) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Unknown',
    address: p.formattedAddress ?? '',
    lat: p.location?.latitude ?? 0,
    lng: p.location?.longitude ?? 0,
    rating: p.rating,
    photos: (p.photos ?? []).slice(0, 4).map((ph: { name: string }) => ph.name),
    phone: p.internationalPhoneNumber,
    website: p.websiteUri,
    isOpen: p.regularOpeningHours?.openNow,
  }))
}

async function geocodeCity(city: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
  )
  const data = await res.json()
  const result = data.results?.[0]
  if (!result) return null
  return {
    lat: result.geometry.location.lat as number,
    lng: result.geometry.location.lng as number,
    formattedAddress: result.formatted_address as string,
  }
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'City is required' }, { status: 400 })

  const geocode = await geocodeCity(city)
  if (!geocode) return NextResponse.json({ error: 'City not found' }, { status: 404 })

  const { lat, lng, formattedAddress } = geocode

  const [masjids, restaurants, meatShops] = await Promise.all([
    searchPlaces(`mosque masjid islamic center in ${city}`, { lat, lng }),
    searchPlaces(`halal restaurant food in ${city}`, { lat, lng }),
    searchPlaces(`halal meat butcher shop grocery in ${city}`, { lat, lng }),
  ])

  const allPlaces: Place[] = [
    ...masjids.map(p => ({ ...p, type: 'masjid' as const })),
    ...restaurants.map(p => ({ ...p, type: 'halal_restaurant' as const })),
    ...meatShops.map(p => ({ ...p, type: 'halal_meat' as const })),
  ].map(p => ({
    ...p,
    distance: parseFloat(haversineDistance(lat, lng, p.lat, p.lng).toFixed(1)),
  }))

  const cells = suggestNeighborhoods(allPlaces, { lat, lng })

  const neighborhoods = cells.map(cell => ({
    lat: cell.lat,
    lng: cell.lng,
    score: cell.score,
    masjidCount: cell.masjid,
    restaurantCount: cell.restaurant,
    meatShopCount: cell.meat,
    nearbyPlaces: allPlaces
      .filter(p => haversineDistance(cell.lat, cell.lng, p.lat, p.lng) < 4)
      .sort((a, b) => {
        const typeOrder = { masjid: 0, halal_meat: 1, halal_restaurant: 2 }
        return typeOrder[a.type] - typeOrder[b.type]
      })
      .slice(0, 5)
      .map(p => p.name),
  }))

  const result: SearchResult = {
    places: allPlaces,
    cityCenter: { lat, lng },
    cityName: formattedAddress,
    neighborhoods,
  }

  return NextResponse.json(result)
}
