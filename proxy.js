/* ============================================================================
   LA CABECERA DE SEGURIDAD QUE TIENE QUE CAMBIAR EN CADA VISITA

   Qué problema resuelve
   ─────────────────────
   La CSP (Content-Security-Policy) es la lista de lo que el navegador tiene
   permitido ejecutar en esta página. Con Vite decía `script-src 'self'`: sólo
   programas que vengan de este mismo sitio, y nada escrito dentro del HTML.

   Next necesita escribir un pedazo de programa DENTRO del HTML (ahí mete los
   datos de la página para que el navegador la "despierte" sin volver a
   pedirla). Con la regla anterior, el navegador lo bloquearía.

   La salida fácil era agregar `'unsafe-inline'`, que es exactamente lo que
   suena: permitir cualquier programa escrito dentro del HTML. Eso abre la
   puerta al ataque más común que hay (que alguien logre meter un programa en
   una página y el navegador lo corra). No se tomó ese camino.

   Lo que hace este archivo
   ────────────────────────
   En cada visita inventa un número al azar irrepetible —el "nonce"— y le dice
   al navegador: *acepto programas escritos dentro del HTML sólo si traen ESTE
   número*. Next lo lee de la cabecera y se lo pone a sus propios scripts. Un
   programa inyectado por un atacante no puede adivinar el número de esa visita
   concreta, así que el navegador lo rechaza.

   🔴 El costo, dicho claro: estas páginas dejan de servirse ya armadas desde la
   red de Vercel y se arman en cada pedido (el número tiene que ser distinto
   cada vez, y algo guardado en caché tendría siempre el mismo). Para un sitio
   con el tráfico de este, es intrascendente. Lo que NO cambia es lo que ve
   Google: el HTML que llega sigue completo, que era el motivo de pasar a Next.

   ⚠️ La CSP se define ACÁ y en ningún otro lado. Si además quedara declarada en
   `next.config.mjs`, el navegador recibiría dos y aplicaría la intersección de
   las dos, que es la forma más confusa que hay de romper un sitio.

   📌 En Next 16 este archivo se llama `proxy.js`. Hasta la 15 se llamaba
   `middleware.js`; es el mismo mecanismo con otro nombre.
============================================================================ */

import { NextResponse } from 'next/server'

const SUPABASE = 'https://wdvvsrikmyorfiimqrkk.supabase.co'

/* 🔴 LAS DOS ÚNICAS LÍNEAS QUE SE AFLOJAN TRABAJANDO, Y POR QUÉ.

   La barra de desarrollo muestra la vista de tablet y de celular metiendo la propia página
   dentro de un marco (un iframe a `/?simulating=true`). Dos reglas de la CSP lo prohíben:
   `frame-src`, que dice qué se puede meter en un marco, y `frame-ancestors`, que dice quién
   puede meter a esta página en uno. En producción las dos están cerradas a propósito —es la
   defensa contra que alguien monte esta web dentro de la suya para engañar a un visitante— y
   así se quedan.

   ⚠️ Esto NO existía antes de la migración y por eso apareció recién ahora: con Vite las
   cabeceras vivían en `vercel.json`, así que **sólo regían en producción** y el servidor de
   desarrollo no tenía ninguna. Al traerlas a `next.config.mjs` y acá —para que lo que se ve
   trabajando sea lo que sale publicado— el simulador se quedó sin marco: apretabas tablet o
   celular y no pasaba nada (Vic, 11-10-2026).

   La diferencia se decide por `NODE_ENV`, que es lo mismo que apaga el botón de publicar. En la
   web publicada estas dos líneas valen `https://www.youtube-nocookie.com` y `'none'`, sin
   excepción. */
const EN_DESARROLLO = process.env.NODE_ENV !== 'production'

export default function proxy(request) {
  // 16 bytes al azar del generador criptográfico del sistema, en base64.
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))))

  const csp = [
    "default-src 'self'",
    "img-src 'self' data:",
    // Las hojas de estilo sí llevan 'unsafe-inline', igual que hoy en producción:
    // Tailwind y React escriben estilos dentro del HTML y un estilo no ejecuta nada.
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'nonce-${nonce}'`,
    `connect-src 'self' ${SUPABASE}`,
    EN_DESARROLLO
      ? "frame-src 'self' https://www.youtube-nocookie.com"
      : 'frame-src https://www.youtube-nocookie.com',
    "object-src 'none'",
    "base-uri 'self'",
    // El salto a Google del login del buzón sale por acá.
    "form-action 'self' https://accounts.google.com",
    EN_DESARROLLO ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
  ].join('; ')

  // Se manda en el PEDIDO para que Next lo lea y firme sus scripts con él...
  const cabeceras = new Headers(request.headers)
  cabeceras.set('x-nonce', nonce)
  cabeceras.set('Content-Security-Policy', csp)

  // ...y en la RESPUESTA para que el navegador lo haga cumplir.
  const respuesta = NextResponse.next({ request: { headers: cabeceras } })
  respuesta.headers.set('Content-Security-Policy', csp)
  return respuesta
}

export const config = {
  /* Las páginas, no los archivos. Un `.js` o una imagen no ejecutan nada por su cuenta:
     hacerlos pasar por acá sólo los sacaría de la caché sin ganar nada. */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|robots.txt).*)'],
}
