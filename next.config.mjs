/* Migrado de vercel.json (11-10-2026). Las mismas cabeceras, una por una.
   Se trae acá y no se deja en vercel.json porque así valen también corriendo en local:
   antes sólo existían en producción y las diferencias aparecían recién al publicar.

   🔴 La Content-Security-Policy NO está acá: la escribe `proxy.js`, porque tiene que cambiar
   en cada visita. Declararla también en este archivo haría que el navegador reciba dos y
   aplique la intersección de ambas. Antes de agregar una línea de CSP acá, leer `proxy.js`. */

const COMUNES = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

export default {
  /* 🔴 El equivalente del `server.allowedHosts` que tenía vite.config.js. Sin esto, entrar al
     servidor de desarrollo por el nombre de Tailscale (en vez de localhost) lo hace rechazar
     los pedidos internos del framework y la página queda a medias.

     ⚠️ Y el otro lado de lo mismo: los dos comandos de package.json llevan `-H 127.0.0.1`
     a propósito. Vite escuchaba sólo en localhost; Next, si no se le dice, escucha en TODAS
     las interfaces, así que la app quedaría visible para cualquiera en la red del lugar donde
     esté la Mac. Además choca con `tailscale serve`, que ya tiene tomado el 5173 del tailnet
     para reenviarlo a 127.0.0.1:5173. */
  allowedDevOrigins: ['macbook-pro-de-victor', 'macbook-pro-de-victor.tail460b3a.ts.net'],

  async headers() {
    return [
      { source: '/:path*', headers: COMUNES },
      {
        // El buzón tiene consultas de personas: nunca se indexa y nunca se guarda en caché.
        source: '/consultas',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}
