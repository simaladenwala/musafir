export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function suggestNeighborhoods(
  places: Array<{ lat: number; lng: number; type: string }>,
  _cityCenter: { lat: number; lng: number }
) {
  if (places.length < 3) return []

  const lats = places.map(p => p.lat)
  const lngs = places.map(p => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const GRID = 4
  const latStep = ((maxLat - minLat) / GRID) || 0.05
  const lngStep = ((maxLng - minLng) / GRID) || 0.05

  type Cell = { lat: number; lng: number; masjid: number; restaurant: number; meat: number }
  const cells: Record<string, Cell> = {}

  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      cells[`${i}_${j}`] = {
        lat: minLat + (i + 0.5) * latStep,
        lng: minLng + (j + 0.5) * lngStep,
        masjid: 0,
        restaurant: 0,
        meat: 0,
      }
    }
  }

  for (const place of places) {
    const i = Math.min(Math.floor((place.lat - minLat) / latStep), GRID - 1)
    const j = Math.min(Math.floor((place.lng - minLng) / lngStep), GRID - 1)
    const cell = cells[`${i}_${j}`]
    if (!cell) continue
    if (place.type === 'masjid') cell.masjid++
    else if (place.type === 'halal_restaurant') cell.restaurant++
    else if (place.type === 'halal_meat') cell.meat++
  }

  return Object.values(cells)
    .map(c => ({ ...c, score: c.masjid * 5 + c.meat * 3 + c.restaurant * 1 }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
