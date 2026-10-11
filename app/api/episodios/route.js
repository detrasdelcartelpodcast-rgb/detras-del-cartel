/* GET /api/episodios → { ok, episodios: [...] }
   Traducido de la función de Vercel (api/episodios.js). Mismo comportamiento: la respuesta
   se guarda 5 min en la CDN y se sirve vieja hasta 1 h si YouTube falla. */
import { obtenerEpisodios } from '../../../lib/youtube.js'

const CACHE_OK = 'public, s-maxage=300, stale-while-revalidate=3600, stale-if-error=3600'

export async function GET() {
  try {
    const datos = await obtenerEpisodios()
    return Response.json(datos, { headers: { 'Cache-Control': CACHE_OK } })
  } catch {
    return Response.json({ ok: false, episodios: [] },
      { status: 502, headers: { 'Cache-Control': 'public, s-maxage=60' } })
  }
}

export const HEAD = GET
