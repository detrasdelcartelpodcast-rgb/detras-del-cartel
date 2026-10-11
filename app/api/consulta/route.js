/* POST /api/consulta → { ok, id } o { ok:false, error }
   Recibe el formulario de «Proponé un tema» y lo guarda en Supabase.
   🔴 La clave secreta vive SOLO acá, en el servidor: nunca llega al navegador. Por eso este
   archivo no puede volverse un componente de cliente. */
import { guardarConsulta } from '../../../lib/consultas.js'

export async function POST(req) {
  // Nada de esto se guarda en ninguna caché: son datos de personas.
  const sinCache = { 'Cache-Control': 'no-store' }
  try {
    const cuerpo = await req.json().catch(() => ({}))
    const r = await guardarConsulta(cuerpo)
    return Response.json(r.ok ? { ok: true, id: r.id } : { ok: false, error: r.error },
      { status: r.estado, headers: sinCache })
  } catch (e) {
    console.error('Error guardando la consulta:', e)
    return Response.json({ ok: false, error: 'No pudimos guardarlo. Probá de nuevo en un rato.' },
      { status: 500, headers: sinCache })
  }
}
