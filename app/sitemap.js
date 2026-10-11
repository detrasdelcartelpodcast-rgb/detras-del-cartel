/* El mapa del sitio: la lista de páginas que un buscador puede recorrer.

   🔴 /consultas NO ESTÁ Y NO SE AGREGA NUNCA. Es el buzón, tiene consultas de personas con
   nombre, mail y teléfono. Ponerlo acá sería invitar al buscador a entrar justo adonde no
   tiene que entrar, y contradiría las otras cuatro capas que lo mantienen afuera.

   Mientras el sitio esté cerrado (`robots.txt` con `Disallow: /`), este archivo existe pero no
   lo lee nadie. Queda hecho para que el día del lanzamiento no haya que acordarse.

   Next lo sirve solo en /sitemap.xml. No hay que declararlo en ningún lado. */

const SITIO = 'https://detrasdelcartel.com'

export default function sitemap() {
  const ahora = new Date()
  return [
    { url: SITIO, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITIO}/privacidad`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
