// Función de Vercel: GET /api/episodios  → { ok, episodios: [{ id, titulo, fecha, resumen }] }
// Sin parámetros. La respuesta se guarda 5 min en la CDN de Vercel (y se sirve vieja hasta 1 h si YouTube falla).
import { obtenerEpisodios } from './_lib/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, episodios: [] });
  }
  try {
    const datos = await obtenerEpisodios();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600, stale-if-error=3600');
    return res.status(200).json(datos);
  } catch {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(502).json({ ok: false, episodios: [] });
  }
}
