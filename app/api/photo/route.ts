import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) return new Response('Missing name', { status: 400 })

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) return new Response('Not found', { status: 404 })

  const buffer = await res.arrayBuffer()
  return new Response(buffer, {
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
