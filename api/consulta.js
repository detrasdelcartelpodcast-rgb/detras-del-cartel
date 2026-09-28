// Función de Vercel: POST /api/consulta → { ok, id } o { ok: false, error }
// Recibe el formulario de "Proponé un tema" y lo guarda en Supabase.
// La clave secreta vive solo acá (variable de entorno); nunca llega al navegador.
import { guardarConsulta } from './_lib/consultas.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  // Nada de esto se guarda en ninguna caché: son datos de personas.
  res.setHeader('Cache-Control', 'no-store');

  try {
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const resultado = await guardarConsulta(cuerpo);
    return res.status(resultado.estado).json(
      resultado.ok ? { ok: true, id: resultado.id } : { ok: false, error: resultado.error }
    );
  } catch (e) {
    console.error('Error guardando la consulta:', e);
    return res.status(500).json({ ok: false, error: 'No pudimos guardarlo. Probá de nuevo en un rato.' });
  }
}
