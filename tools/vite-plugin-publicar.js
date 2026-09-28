import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

/* ==========================================================================
   BOTÓN DE PUBLICAR — SOLO EN DESARROLLO (localhost)

   Expone /__publicar/* en el servidor de Vite para que la barra flotante
   pueda publicar el sitio sin salir del navegador. `apply: 'serve'`: este
   código NUNCA se compila ni viaja a Vercel.

   CANDADOS (un endpoint que ejecuta `git push` no puede quedar abierto):
   1. Token generado al arrancar el servidor; solo se inyecta al cliente en
      modo desarrollo. Va en una cabecera propia, lo que obliga al navegador
      a pedir permiso previo (preflight) desde cualquier otro sitio: una
      pestaña ajena abierta en tu máquina no puede disparar una publicación.
   2. Si viene `Origin`, tiene que ser localhost/127.0.0.1.
   3. Solo se publica desde la rama `main`.
   4. Antes de subir nada se revisa que no haya claves ni `.env` en lo que se
      va a publicar, y que el paquete compilado no contenga una clave.
========================================================================== */

const TOKEN = randomUUID()
const RAIZ = process.cwd()
const RAMA = 'main'
const WEB = 'https://detras-del-cartel.vercel.app'

// Lo que NUNCA puede viajar al repositorio ni al paquete compilado.
const PATRONES_SECRETO = [
  { nombre: 'clave de Google/YouTube', re: /AIza[0-9A-Za-z_-]{30,}/ },
  { nombre: 'clave privada', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { nombre: 'token de GitHub', re: /gh[pousr]_[0-9A-Za-z]{30,}/ },
]

function correr(cmd, args, opciones = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: RAIZ, maxBuffer: 10 * 1024 * 1024, timeout: 300000, ...opciones }, (error, stdout, stderr) => {
      // `crudo` conserva los espacios del principio: `git status --porcelain` los usa
      // como parte del formato (" M archivo"), y recortarlos corría el nombre un carácter.
      resolve({ ok: !error, salida: `${stdout}${stderr}`.trim(), crudo: `${stdout}`, codigo: error?.code ?? 0 })
    })
  })
}

async function leerCuerpo(req) {
  const trozos = []
  for await (const t of req) trozos.push(t)
  try {
    return JSON.parse(Buffer.concat(trozos).toString() || '{}')
  } catch {
    return {}
  }
}

function responder(res, estado, datos) {
  res.statusCode = estado
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(datos))
}

function permitido(req) {
  if (req.headers['x-publicar-token'] !== TOKEN) return false
  const origen = req.headers.origin
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
  return { rama, cambios, commits, ramaCorrecta: rama === RAMA, hayAlgo: cambios.length > 0 || commits.length > 0 }
}

/** Busca claves y archivos prohibidos en lo que está por publicarse. */
async function revisarSecretos(archivos) {
  const hallazgos = []
  for (const archivo of archivos) {
    // `.env.example` es la PLANTILLA: solo nombres de variables, sin ningún valor,
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
  const { salida } = await correr('grep', ['-rlE', PATRONES_SECRETO.map((p) => p.re.source).join('|'), 'dist'])
  return salida ? salida.split('\n').map((f) => `${f}: el paquete compilado contiene algo que parece una clave`) : []
}

/** Nombre del archivo principal del paquete: sirve para confirmar que Vercel ya sirve esta versión. */
async function huellaCompilado() {
  try {
    const html = await readFile(path.join(RAIZ, 'dist/index.html'), 'utf8')
    return html.match(/\/assets\/[A-Za-z0-9._-]+\.js/)?.[0] ?? null
  } catch {
    return null
  }
}

async function esperarEnVivo(huella, maximoMs = 240000) {
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

export default function publicarLocal() {
  return {
    name: 'publicar-desde-la-barra',
    apply: 'serve',

    // El token solo existe mientras corre el servidor de desarrollo: se inyecta en la
    // página de localhost. Otra pestaña no puede leerlo (el navegador no deja leer una
    // respuesta de otro origen) ni adivinarlo.
    transformIndexHtml() {
      return [{ tag: 'script', injectTo: 'head', children: `window.__TOKEN_PUBLICAR__=${JSON.stringify(TOKEN)}` }]
    },

    configureServer(server) {
      server.middlewares.use('/__publicar/estado', async (req, res) => {
        if (!permitido(req)) return responder(res, 403, { ok: false, error: 'sin permiso' })
        responder(res, 200, { ok: true, ...(await estado()) })
      })

      server.middlewares.use('/__publicar/ejecutar', async (req, res) => {
        if (req.method !== 'POST') return responder(res, 405, { ok: false, error: 'método no permitido' })
        if (!permitido(req)) return responder(res, 403, { ok: false, error: 'sin permiso' })

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
          responder(res, 200, { ok: false, pasos })
        }

        if (!revisionHecha) {
          return fallar(
            'Revisión de seguridad',
            'Falta la constancia del /security-review. La deja Claude en `.deploy-siguiente.json` al terminar un trabajo; pedísela antes de publicar.'
          )
        }

        const est = await estado()
        if (!est.ramaCorrecta) return fallar('Rama', `Estás en "${est.rama}" y solo se publica desde "${RAMA}".`)
        if (!est.hayAlgo) return fallar('Cambios', 'No hay nada para publicar: producción ya está al día.')
        registrar('Rama y cambios', true, `${est.cambios.length} archivo(s) modificado(s), ${est.commits.length} commit(s) sin subir`)

        if (est.cambios.length) {
          const hallazgos = await revisarSecretos(est.cambios)
          if (hallazgos.length) return fallar('Claves y archivos prohibidos', hallazgos.join('\n'))
        }
        registrar('Claves y archivos prohibidos', true, 'Nada sospechoso en los archivos a publicar')

        const pruebas = await correr('npm', ['run', 'probar'])
        if (!pruebas.ok) return fallar('Pruebas', pruebas.salida.split('\n').slice(-25).join('\n'))
        registrar('Pruebas', true, pruebas.salida.split('\n').filter((l) => /pruebas OK|✗/.test(l)).join('\n'))

        const compilar = await correr('npm', ['run', 'build'])
        if (!compilar.ok) return fallar('Compilación', compilar.salida.split('\n').slice(-25).join('\n'))
        registrar('Compilación', true, compilar.salida.split('\n').filter((l) => /built in|error/i.test(l)).join('\n'))

        const enCompilado = await revisarCompilado()
        if (enCompilado.length) return fallar('Revisión del paquete compilado', enCompilado.join('\n'))
        registrar('Revisión del paquete compilado', true, 'Sin claves en lo que se sube')

        if (est.cambios.length) {
          const texto = (mensaje || '').trim()
          if (texto.length < 8) {
            return fallar('Mensaje', 'Falta el texto del cambio en `.deploy-siguiente.json`. Lo escribe Claude al cerrar el trabajo.')
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

        const huella = await huellaCompilado()
        if (huella) {
          const enVivo = await esperarEnVivo(huella)
          registrar(
            'Verificación en vivo',
            enVivo,
            enVivo ? `${WEB} ya sirve esta versión` : 'Vercel todavía no publicó esta versión (puede tardar). Revisá el panel de Vercel.'
          )
        }

        // La nota se consume: una constancia vieja no sirve para el próximo deploy.
        await writeFile(
          path.join(RAIZ, '.deploy-siguiente.json'),
          JSON.stringify({ mensaje: '', security_review: false, publicado_en: new Date().toISOString() }, null, 2)
        )

        responder(res, 200, { ok: pasos.every((p) => p.ok), pasos, web: WEB })
      })
    },
  }
}
