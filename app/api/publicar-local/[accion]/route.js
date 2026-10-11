import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/* ==========================================================================
   BOTÓN DE PUBLICAR — SOLO EN DESARROLLO (localhost)

   Traducido de `tools/vite-plugin-publicar.js` el 11-10-2026, al pasar de Vite
   a Next. Mismos pasos y mismos candados; cambió sólo la forma de escribirlo.

   ⚠️ SE LLAMA `publicar-local` Y NO `__publicar` POR UN MOTIVO: Next ignora por completo
   las carpetas cuyo nombre empieza con guión bajo (las considera privadas y no las pone en
   ninguna dirección). Con el nombre viejo el endpoint compilaba sin un solo error y después
   devolvía 404: el botón no habría publicado nada y no habría dicho por qué.

   🔴 LA DIFERENCIA QUE HAY QUE TENER PRESENTE: en Vite este archivo tenía
   `apply: 'serve'`, o sea que NUNCA se compilaba ni viajaba a Vercel. En Next
   no existe esa marca: este archivo SÍ se compila y SÍ se sube. Lo que lo deja
   inofensivo es el primer candado de abajo, que lo convierte en un 404 cuando
   no está corriendo en la máquina de Vic. Si alguien algún día saca esa línea,
   deja un endpoint que ejecuta `git push` abierto en internet.

   CANDADOS (un endpoint que ejecuta `git push` no puede quedar abierto):
   0. En producción no existe: devuelve 404, como cualquier dirección inventada.
   1. Token generado al arrancar el servidor, que vive sólo en memoria. Va en
      una cabecera propia, lo que obliga al navegador a pedir permiso previo
      (preflight) desde cualquier otro sitio: una pestaña ajena abierta en la
      misma máquina no puede disparar una publicación.
   2. Si viene `Origin`, tiene que ser localhost/127.0.0.1.
   3. Sólo se publica desde la rama `main`.
   4. Antes de subir nada se revisa que no haya claves ni `.env` en lo que se va
      a publicar, y que el paquete compilado no contenga una clave.
========================================================================== */

// Candado 0. Primero que nada, porque si esto es producción no hay nada más que hablar.
const EN_PRODUCCION = process.env.NODE_ENV === 'production'

const TOKEN = randomUUID()
const RAIZ = process.cwd()
const RAMA = 'main'
const WEB = 'https://detras-del-cartel.vercel.app'
// Carpeta aparte para la compilación de control: no puede pisar la que usa el
// servidor de desarrollo que Vic tiene abierto en el navegador.
const COMPILADO = '.next-publicar'

// Resultado del último deploy. La verificación en vivo sigue corriendo en el
// servidor aunque Vic cierre la pestaña: el deploy NO depende del navegador.
let ultimoDeploy = null

// Lo que NUNCA puede viajar al repositorio ni al paquete compilado.
const PATRONES_SECRETO = [
  { nombre: 'clave de Google/YouTube', re: /AIza[0-9A-Za-z_-]{30,}/ },
  { nombre: 'clave privada', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { nombre: 'token de GitHub', re: /gh[pousr]_[0-9A-Za-z]{30,}/ },
]

function correr(cmd, args, opciones = {}) {
  return new Promise((resolve) => {
    execFile(
      cmd,
      args,
      { cwd: RAIZ, maxBuffer: 10 * 1024 * 1024, timeout: 600000, ...opciones },
      (error, stdout, stderr) => {
        // `crudo` conserva los espacios del principio: `git status --porcelain` los usa
        // como parte del formato (" M archivo"), y recortarlos corría el nombre un carácter.
        resolve({
          ok: !error,
          salida: `${stdout}${stderr}`.trim(),
          crudo: `${stdout}`,
          codigo: error?.code ?? 0,
        })
      }
    )
  })
}

const json = (datos, estado = 200) => Response.json(datos, { status: estado })
const noExiste = () => new Response('Not Found', { status: 404 })

function permitido(request) {
  if (request.headers.get('x-publicar-token') !== TOKEN) return false
  const origen = request.headers.get('origin')
  if (origen && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen)) return false
  return true
}

/** Estado del repositorio: qué se publicaría si apretás el botón. */
async function estado() {
  const rama = (await correr('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).salida
  const sucio = (await correr('git', ['status', '--porcelain'])).crudo
  const cambios = sucio
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3).replace(/^"|"$/g, ''))
  const sinSubir = (await correr('git', ['log', '--oneline', `origin/${RAMA}..HEAD`])).salida
  const commits = sinSubir ? sinSubir.split('\n') : []
  return {
    rama,
    cambios,
    commits,
    ramaCorrecta: rama === RAMA,
    hayAlgo: cambios.length > 0 || commits.length > 0,
  }
}

/** Busca claves y archivos prohibidos en lo que está por publicarse. */
async function revisarSecretos(archivos) {
  const hallazgos = []
  for (const archivo of archivos) {
    // `.env.example` es la PLANTILLA: sólo nombres de variables, sin ningún valor,
    // y el .gitignore la deja pasar a propósito para que quien retome sepa qué hace
    // falta configurar. Igual se le revisa el contenido más abajo, como a cualquier otro.
    const esPlantilla = /(^|\/)\.env\.example$/.test(archivo)
    if (/(^|\/)\.env/.test(archivo) && !esPlantilla) {
      hallazgos.push(`${archivo}: es un archivo de entorno, no puede subirse`)
      continue
    }
    let texto = ''
    try {
      texto = await readFile(path.join(RAIZ, archivo), 'utf8')
    } catch {
      continue // borrado o binario: nada que leer
    }
    for (const { nombre, re } of PATRONES_SECRETO) {
      if (re.test(texto)) hallazgos.push(`${archivo}: parece contener una ${nombre}`)
    }
  }
  return hallazgos
}

/** Revisa el paquete ya compilado (lo que realmente se sube a Vercel). */
async function revisarCompilado() {
  const { salida } = await correr('grep', [
    '-rlE',
    PATRONES_SECRETO.map((p) => p.re.source).join('|'),
    COMPILADO,
  ])
  return salida
    ? salida
        .split('\n')
        .filter(Boolean)
        .map((f) => `${f}: el paquete compilado contiene algo que parece una clave`)
    : []
}

/* La huella de la versión publicada. Con Vite era el nombre del archivo .js del paquete;
   en Next es el identificador del cambio en Git, que `next.config.mjs` usa como BUILD_ID
   y que por eso aparece dentro del HTML. Se lee DESPUÉS del commit: el commit es,
   justamente, lo que se va a publicar. */
async function huellaPublicada() {
  const { ok, salida } = await correr('git', ['rev-parse', 'HEAD'])
  return ok && salida ? salida : null
}

async function esperarEnVivo(huella, maximoMs = 300000) {
  const desde = Date.now()
  while (Date.now() - desde < maximoMs) {
    try {
      const r = await fetch(`${WEB}/?v=${Date.now()}`, { cache: 'no-store' })
      if (r.ok && (await r.text()).includes(huella)) return true
    } catch {
      // Vercel puede estar redesplegando: se reintenta
    }
    await new Promise((r) => setTimeout(r, 6000))
  }
  return false
}

async function ejecutar() {
  // El mensaje y la constancia de la revisión NO se le piden a Vic: los deja
  // escritos Claude en `.deploy-siguiente.json` al terminar cada trabajo.
  let mensaje = ''
  let revisionHecha = false
  try {
    const nota = JSON.parse(await readFile(path.join(RAIZ, '.deploy-siguiente.json'), 'utf8'))
    mensaje = nota.mensaje || ''
    revisionHecha = nota.security_review === true
  } catch {
    // Sin archivo: se avisa abajo y no se publica.
  }

  const pasos = []
  const registrar = (titulo, ok, detalle = '') => pasos.push({ titulo, ok, detalle })
  const fallar = (titulo, detalle) => {
    registrar(titulo, false, detalle)
    return json({ ok: false, pasos })
  }

  if (!revisionHecha) {
    return fallar(
      'Revisión de seguridad',
      'Falta la constancia del /security-review. La deja Claude en `.deploy-siguiente.json` al terminar un trabajo; pedísela antes de publicar.'
    )
  }

  const est = await estado()
  if (!est.ramaCorrecta) return fallar('Rama', `Estás en "${est.rama}" y sólo se publica desde "${RAMA}".`)
  if (!est.hayAlgo) return fallar('Cambios', 'No hay nada para publicar: producción ya está al día.')
  registrar(
    'Rama y cambios',
    true,
    `${est.cambios.length} archivo(s) modificado(s), ${est.commits.length} commit(s) sin subir`
  )

  if (est.cambios.length) {
    const hallazgos = await revisarSecretos(est.cambios)
    if (hallazgos.length) return fallar('Claves y archivos prohibidos', hallazgos.join('\n'))
  }
  registrar('Claves y archivos prohibidos', true, 'Nada sospechoso en los archivos a publicar')

  const pruebas = await correr('npm', ['run', 'probar'])
  if (!pruebas.ok) return fallar('Pruebas', pruebas.salida.split('\n').slice(-25).join('\n'))
  registrar('Pruebas', true, pruebas.salida.split('\n').filter((l) => /pruebas OK|✗/.test(l)).join('\n'))

  // Compila en una carpeta aparte, para no pisar la que está usando este mismo servidor.
  const compilar = await correr('npm', ['run', 'build'], {
    env: { ...process.env, CARPETA_COMPILADO: COMPILADO },
  })
  if (!compilar.ok) return fallar('Compilación', compilar.salida.split('\n').slice(-25).join('\n'))
  registrar('Compilación', true, compilar.salida.split('\n').filter((l) => /Compiled|error/i.test(l)).join('\n'))

  const enCompilado = await revisarCompilado()
  if (enCompilado.length) return fallar('Revisión del paquete compilado', enCompilado.join('\n'))
  registrar('Revisión del paquete compilado', true, 'Sin claves en lo que se sube')

  if (est.cambios.length) {
    const texto = (mensaje || '').trim()
    if (texto.length < 8) {
      return fallar(
        'Mensaje',
        'Falta el texto del cambio en `.deploy-siguiente.json`. Lo escribe Claude al cerrar el trabajo.'
      )
    }
    const add = await correr('git', ['add', '-A'])
    if (!add.ok) return fallar('Preparar el commit', add.salida)
    const commit = await correr('git', ['commit', '-m', texto])
    if (!commit.ok) return fallar('Commit', commit.salida)
    registrar('Commit', true, commit.salida.split('\n')[0])
  }

  const push = await correr('git', ['push', 'origin', RAMA])
  if (!push.ok) return fallar('Subir a GitHub', push.salida)
  registrar('Subir a GitHub', true, 'Vercel arranca el despliegue solo')

  // Se contesta ACÁ, apenas el cambio está en GitHub y Vercel arrancó solo.
  // La verificación en vivo sigue por su cuenta: si Vic cierra la pestaña,
  // el deploy se completa igual.
  const huella = await huellaPublicada()
  ultimoDeploy = { estado: 'verificando', desde: new Date().toISOString(), pasos }
  if (huella) {
    const desde = ultimoDeploy.desde
    esperarEnVivo(huella).then((enVivo) => {
      ultimoDeploy = {
        estado: enVivo ? 'publicado' : 'sin_confirmar',
        desde,
        hasta: new Date().toISOString(),
        detalle: enVivo
          ? `${WEB} ya sirve esta versión`
          : 'Vercel todavía no publicó esta versión. Revisá el panel de Vercel.',
        pasos,
      }
    })
  } else {
    ultimoDeploy = { estado: 'publicado', pasos }
  }

  // La nota se consume: una constancia vieja no sirve para el próximo deploy.
  await writeFile(
    path.join(RAIZ, '.deploy-siguiente.json'),
    JSON.stringify({ mensaje: '', security_review: false, publicado_en: new Date().toISOString() }, null, 2)
  )

  return json({ ok: pasos.every((p) => p.ok), pasos, web: WEB })
}

export async function GET(request, { params }) {
  if (EN_PRODUCCION) return noExiste()
  const { accion } = await params

  /* El token se entrega por su propia dirección, y ésta es la única que no lo pide (no
     podría: es la que lo da). Que se pueda pedir no lo vuelve público: una pestaña de otro
     sitio puede disparar el pedido, pero el navegador no la deja LEER la respuesta, que es
     de otro origen. Sin leerla, no tiene el token, y sin token no puede publicar. */
  if (accion === 'token') return json({ ok: true, token: TOKEN })

  if (!permitido(request)) return json({ ok: false, error: 'sin permiso' }, 403)
  if (accion === 'estado') return json({ ok: true, ...(await estado()) })
  if (accion === 'ultimo') return json({ ok: true, ultimo: ultimoDeploy })
  return noExiste()
}

export async function POST(request, { params }) {
  if (EN_PRODUCCION) return noExiste()
  const { accion } = await params
  if (accion !== 'ejecutar') return noExiste()
  if (!permitido(request)) return json({ ok: false, error: 'sin permiso' }, 403)
  return ejecutar()
}

/* Nunca guardar nada de esto en caché: la respuesta depende del estado del repositorio
   en este segundo, y una respuesta vieja diría que no hay nada para publicar. */
export const dynamic = 'force-dynamic'
