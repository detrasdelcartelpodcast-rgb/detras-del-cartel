import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import publicarLocal from './tools/vite-plugin-publicar.js'

// Al compilar, descarta las imágenes que NINGÚN código publicado usa.
// Motivo: mientras el sitio esté "en construcción", las fotos de los conductores
// (src/assets/hosts/) no deben quedar accesibles por URL en Vercel aunque no se muestren.
// Cuando se active esa sección, las imágenes pasan a estar referenciadas y se incluyen solas.
function purgarImagenesSinUso() {
  return {
    name: 'purgar-imagenes-sin-uso',
    apply: 'build',
    generateBundle(_, bundle) {
      const texto = Object.values(bundle)
        .map((f) => (f.type === 'chunk' ? f.code : typeof f.source === 'string' ? f.source : ''))
        .join('\n')
      for (const [nombre, f] of Object.entries(bundle)) {
        if (f.type === 'asset' && /\.(png|jpe?g|webp|gif|avif)$/i.test(nombre)) {
          if (!texto.includes(nombre.split('/').pop())) delete bundle[nombre]
        }
      }
    },
  }
}

// SOLO en localhost: Vite no ejecuta las funciones de /api (Vercel sí, en producción).
// Este plugin sirve /api/episodios con EL MISMO código (api/_lib/youtube.js), así lo que ves acá es lo que corre en Vercel.
function apiLocal() {
  return {
    name: 'api-local-episodios',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/episodios', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        try {
          const { obtenerEpisodios } = await server.ssrLoadModule('/api/_lib/youtube.js')
          res.statusCode = 200
          res.end(JSON.stringify(await obtenerEpisodios()))
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ ok: false, episodios: [] }))
        }
      })
    },
  }
}

// SOLO en localhost: hace de "función de Vercel" para POST /api/consulta,
// con el mismo código que corre en producción (api/_lib/consultas.js).
function apiConsultaLocal() {
  return {
    name: 'api-local-consulta',
    apply: 'serve',
    configureServer(server) {
      // Vite solo expone al navegador las variables VITE_*; acá, del lado del
      // servidor, hacen falta todas (incluida la clave secreta de Supabase).
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))

      server.middlewares.use('/api/consulta', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ ok: false, error: 'Método no permitido.' }))
        }
        try {
          const trozos = []
          for await (const t of req) trozos.push(t)
          const cuerpo = JSON.parse(Buffer.concat(trozos).toString() || '{}')
          const { guardarConsulta } = await server.ssrLoadModule('/api/_lib/consultas.js')
          const resultado = await guardarConsulta(cuerpo)
          res.statusCode = resultado.estado
          res.end(JSON.stringify(resultado.ok ? { ok: true, id: resultado.id } : { ok: false, error: resultado.error }))
        } catch (e) {
          console.error('Error guardando la consulta:', e)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, error: 'No pudimos guardarlo. Probá de nuevo en un rato.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), purgarImagenesSinUso(), apiLocal(), apiConsultaLocal(), publicarLocal()],

  // SOLO para el servidor de desarrollo (no afecta el build ni lo que corre en Vercel).
  // Vite rechaza cualquier pedido cuyo Host no reconozca — es su defensa contra DNS
  // rebinding — y responde "Blocked request. This host is not allowed". Sin esto, entrar
  // desde la MacBook Air o el celular por Tailscale muestra ese error en vez del sitio.
  // A diferencia de Next, que solo tira un warning, Vite lo bloquea de verdad.
  // Si cambia el nombre del tailnet, actualizar esta lista.
  server: {
    allowedHosts: [
      'macbook-pro-de-victor',
      'macbook-pro-de-victor.tail460b3a.ts.net',
    ],
  },
})
