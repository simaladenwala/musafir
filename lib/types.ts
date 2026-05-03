export type PlaceType = 'masjid' | 'halal_restaurant' | 'halal_meat'

export interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: PlaceType
  rating?: number
  photos: string[]
  phone?: string
  website?: string
  isOpen?: boolean
  distance: number
}

export interface Neighborhood {
  lat: number
  lng: number
  score: number
  masjidCount: number
  restaurantCount: number
  meatShopCount: number
  nearbyPlaces: string[]
}

export interface SearchResult {
  places: Place[]
  cityCenter: { lat: number; lng: number }
  cityName: string
  neighborhoods: Neighborhood[]
}
