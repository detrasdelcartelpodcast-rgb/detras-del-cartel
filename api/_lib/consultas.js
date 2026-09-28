/* ============================================================================
   GUARDAR UNA CONSULTA DEL FORMULARIO

   Este código corre SIEMPRE en el servidor (función de Vercel en producción,
   plugin de Vite en localhost). Usa la clave secreta de Supabase, que saltea
   RLS: por eso nunca puede llegar al navegador.

   Regla de fondo: no se confía en nada de lo que manda el navegador. El tipo
   de consulta se decide acá y, si es anónima, los datos de contacto se borran
   antes de guardar. La base además lo vuelve a controlar por su cuenta.
============================================================================ */

const TIPOS = ['programa', 'privado', 'anonimo']
const LIMITE_POR_MINUTO = 10 // freno global contra una avalancha automática

const texto = (v, max) => {
  if (typeof v !== 'string') return null
  const limpio = v.trim().replace(/\s+/g, ' ')
  return limpio ? limpio.slice(0, max) : null
}

/** Valida y normaliza lo que llegó del formulario. Devuelve { fila } o { error }. */
export function prepararConsulta(cuerpo = {}) {
  // Trampa para robots: un campo invisible que una persona nunca completa.
  if (texto(cuerpo.web, 50)) return { error: 'No se pudo enviar.' }

  // Un formulario completado en menos de 3 segundos no lo llenó una persona.
  const demora = Number(cuerpo.demora)
  if (!Number.isFinite(demora) || demora < 3000) return { error: 'No se pudo enviar.' }

  const tipo = TIPOS.includes(cuerpo.tipo) ? cuerpo.tipo : null
  if (!tipo) return { error: 'Elegí qué querés que hagamos con tu consulta.' }

  const tema = texto(cuerpo.tema, 300)
  if (!tema || tema.length < 3) return { error: 'Contanos qué te está pasando.' }

  const anonima = tipo === 'anonimo'
  const email = anonima ? null : texto(cuerpo.email, 200)
  const telefono = anonima ? null : texto(cuerpo.telefono, 40)

  // La dirección no puede traer caracteres de dirección web (? & = % " ' < >).
  // Si no, alguien puede mandar algo como "victima@mail.com?bcc=otro%40evil.com"
  // y, cuando desde el buzón se aprieta "Responder por mail", el programa de
  // correo abre el mensaje con una copia oculta hacia un tercero: la respuesta
  // a una consulta privada se le escaparía a alguien de afuera.
  if (email && !/^[^\s@?&=%"'<>,;:]+@[^\s@?&=%"'<>,;:]+\.[A-Za-z]{2,}$/.test(email)) {
    return { error: 'Revisá el mail: parece que le falta algo.' }
  }
  if (tipo === 'privado' && !email && !telefono) {
    return { error: 'Dejanos un mail o un WhatsApp para poder contestarte.' }
  }

  return {
    fila: {
      tipo,
      tema,
      detalle: texto(cuerpo.detalle, 4000),
      // En una consulta anónima no se guarda NADA que identifique, ni de dónde llegó.
      nombre: anonima ? null : texto(cuerpo.nombre, 120),
      email,
      telefono,
      zona: anonima ? null : texto(cuerpo.zona, 120),
      origen: anonima ? null : texto(cuerpo.origen, 200),
      // El permiso no aplica a las privadas: no salen al aire.
      permiso_uso: tipo === 'privado' ? false : cuerpo.permiso_uso === true,
    },
  }
}

function pedir(ruta, opciones = {}) {
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const clave = process.env.SUPABASE_SECRET_KEY
  if (!base || !clave) throw new Error('Falta configurar Supabase en las variables de entorno.')
  return fetch(`${base}/rest/v1/${ruta}`, {
    ...opciones,
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/json',
      ...opciones.headers,
    },
  })
}

/** Freno de avalancha: no guarda IPs (las anónimas dejarían de ser anónimas). */
async function demasiadasEnElMinuto() {
  const desde = new Date(Date.now() - 60_000).toISOString()
  const r = await pedir(`consultas?select=id&creado_en=gte.${desde}`, {
    headers: { Prefer: 'count=exact', Range: '0-0' },
  })
  const total = Number((r.headers.get('content-range') || '').split('/')[1])
  return Number.isFinite(total) && total >= LIMITE_POR_MINUTO
}

export async function guardarConsulta(cuerpo) {
  const { fila, error } = prepararConsulta(cuerpo)
  if (error) return { ok: false, estado: 400, error }

  if (await demasiadasEnElMinuto()) {
    return { ok: false, estado: 429, error: 'Estamos recibiendo muchas consultas. Probá en un minuto.' }
  }

  const r = await pedir('consultas?select=id', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(fila),
  })

  if (!r.ok) {
    // El detalle real queda en los registros del servidor, no viaja al navegador.
    console.error('Supabase rechazó la consulta:', r.status, await r.text())
    return { ok: false, estado: 502, error: 'No pudimos guardarlo. Probá de nuevo en un rato.' }
  }

  const [guardada] = await r.json()
  return { ok: true, estado: 200, id: guardada?.id ?? null }
}
