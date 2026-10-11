/* El armazón de todas las páginas. Reemplaza al index.html de Vite.
   Las cabeceras de seguridad NO viven acá: están en next.config.mjs y en proxy.js. */
import '../src/index.css'

/* 🔴 NO BORRAR ESTA LÍNEA SIN LEER proxy.js.
   `proxy.js` firma los programas de la página con un número al azar distinto en cada visita,
   para no tener que permitir programas sin firma (que es el agujero más explotado que hay).
   Para poder firmarlos, Next tiene que armar la página EN el pedido: si se la deja armar una
   sola vez al compilar, el HTML sale sin firma, el navegador bloquea los tres programas
   internos y la página se ve perfecta pero no responde a nada.

   Medido el 11-10-2026: sin esta línea, `window.__next_f` no existe y la consola muestra
   «Executing inline script violates the following Content Security Policy directive».
   Las capturas salían idénticas igual — por eso la prueba no puede ser mirar la pantalla. */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Detrás del Cartel',
  description: 'Podcast inmobiliario',
  /* 🔴 Mientras el podcast no lance, el sitio entero está cerrado a los buscadores.
     AL LANZAR hay que borrar la línea de abajo, Y la cabecera `X-Robots-Tag` de la lista
     COMUNES en next.config.mjs, Y el `Disallow: /` de public/robots.txt. Son tres, y hay
     otras cuatro que NO se tocan nunca (las que mantienen el buzón fuera de Google).
     La lista completa, con cómo verificarlo el mismo día: _Documentacion/LANZAMIENTO.md */
  robots: { index: false, follow: false, nocache: true },
}

export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
