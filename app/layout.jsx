/* El armazón de todas las páginas. Reemplaza al index.html de Vite.
   Las cabeceras de seguridad NO viven acá: están en next.config.mjs y en proxy.js. */
import '../src/index.css'
import { datosEstructurados } from './datos-estructurados'

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

export const SITIO = 'https://detrasdelcartel.com'

export const metadata = {
  /* La dirección base. Sin esto, las etiquetas de vista previa salen con direcciones
     relativas y ni WhatsApp ni LinkedIn encuentran la imagen. */
  metadataBase: new URL(SITIO),

  title: 'Detrás del Cartel — Podcast inmobiliario de Buenos Aires',
  description:
    'Daniel Bryn y Víctor Miascovsky cuentan lo que pasa detrás de una operación inmobiliaria en Buenos Aires: casos reales, precios y decisiones, explicados sin vueltas.',

  /* 🔴 La dirección oficial de cada página, siempre sin www. El mismo contenido se sirve hoy
     por tres direcciones —el dominio, el www y la de Vercel— y sin esto un buscador puede
     tomarlas como páginas distintas y repartir el crédito entre las tres. */
  alternates: { canonical: '/' },

  /* La vista previa al compartir. La IMAGEN no se declara acá: Next la toma sola de
     `app/opengraph-image.png` (1200×630) y arma `og:image` y `twitter:image` con las medidas
     correctas. Si se cambia la imagen, se reemplaza ese archivo y listo. */
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITIO,
    siteName: 'Detrás del Cartel',
    title: 'Detrás del Cartel — Podcast inmobiliario de Buenos Aires',
    description:
      'Lo que pasa detrás de una operación inmobiliaria en Buenos Aires: casos reales, precios y decisiones, explicados sin vueltas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detrás del Cartel — Podcast inmobiliario de Buenos Aires',
    description:
      'Lo que pasa detrás de una operación inmobiliaria en Buenos Aires: casos reales, precios y decisiones.',
  },

  /* 🔴 Mientras el podcast no lance, el sitio entero está cerrado a los buscadores.
     Todo lo de arriba YA ESTÁ LISTO y esperando detrás de esta línea: se escribió el
     11-10-2026 a propósito, para que el día del lanzamiento haya que tocar una sola cosa.

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
      <body>
        {/* 🔴 Lo que le dice a Google y a las IA QUÉ es esto, en un formato que entienden sin
            tener que deducirlo del texto: que es un podcast, quiénes lo conducen, en qué idioma
            y sobre qué zona. Ver app/datos-estructurados.js. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
        {children}
      </body>
    </html>
  )
}
