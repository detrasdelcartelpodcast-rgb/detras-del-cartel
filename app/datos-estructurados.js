/* ============================================================================
   LO QUE LE DICE A GOOGLE Y A LAS IA QUÉ ES ESTE SITIO

   Es un bloque de datos en un formato estándar (JSON-LD) que va dentro del HTML.
   No se ve en la pantalla: lo leen las máquinas.

   Para qué sirve, en concreto. El texto de la página dice las cosas en prosa y
   hay que deducirlas; esto las afirma sin ambigüedad: que es un PODCAST (y no
   una inmobiliaria), quiénes lo conducen, en qué idioma y SOBRE QUÉ ZONA. Eso
   último es lo que permite que aparezca cuando alguien —o una IA— pregunta por
   un podcast inmobiliario de Buenos Aires.

   🔴 No reemplaza al texto visible, lo acompaña. Una IA cita la prosa; esto la
   ayuda a clasificar la página y a no confundirse. Si mañana el texto visible
   dijera otra cosa que lo de acá, gana el texto visible y esto pasa a ser ruido:
   hay que mantenerlos coherentes.

   📌 Escrito el 11-10-2026, con el sitio todavía cerrado a los buscadores. Está
   listo y esperando: el día del lanzamiento no hay que agregarlo, ya está.

   PENDIENTE para cuando haya episodios: agregar `webFeed` con la dirección del
   RSS de Spotify for Creators (nace al publicar el primer episodio). Con eso,
   Google puede mostrar el reproductor en los resultados.
============================================================================ */

const SITIO = 'https://detrasdelcartel.com'

export const datosEstructurados = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'PodcastSeries',
      '@id': `${SITIO}/#podcast`,
      name: 'Detrás del Cartel',
      alternateName: 'Detrás del Cartel — Podcast inmobiliario',
      url: SITIO,
      description:
        'Daniel Bryn y Víctor Miascovsky cuentan lo que pasa detrás de una operación inmobiliaria en Buenos Aires: casos reales, precios y decisiones, explicados sin vueltas.',
      inLanguage: 'es-AR',
      image: `${SITIO}/opengraph-image.png`,
      // De qué habla. Sin esto hay que deducirlo del texto.
      about: [
        { '@type': 'Thing', name: 'Mercado inmobiliario' },
        { '@type': 'Thing', name: 'Compra y venta de propiedades' },
        { '@type': 'Thing', name: 'Herencias y sucesiones' },
        { '@type': 'Thing', name: 'Inversión inmobiliaria' },
      ],
      // 🔴 La zona. Es lo que faltaba por completo: la página no nombraba
      //    Buenos Aires en ninguna parte.
      spatialCoverage: {
        '@type': 'Place',
        name: 'Buenos Aires, Argentina',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Buenos Aires',
          addressRegion: 'Ciudad Autónoma de Buenos Aires y Gran Buenos Aires',
          addressCountry: 'AR',
        },
      },
      author: [{ '@id': `${SITIO}/#daniel` }, { '@id': `${SITIO}/#victor` }],
      actor: [{ '@id': `${SITIO}/#daniel` }, { '@id': `${SITIO}/#victor` }],
    },
    {
      '@type': 'Person',
      '@id': `${SITIO}/#daniel`,
      name: 'Daniel Bryn',
      jobTitle: 'Contador y corredor inmobiliario',
      knowsAbout: ['Mercado inmobiliario', 'Corretaje inmobiliario'],
    },
    {
      '@type': 'Person',
      '@id': `${SITIO}/#victor`,
      name: 'Víctor Miascovsky',
      jobTitle: 'Contador y consultor inmobiliario',
      knowsAbout: ['Valuación de propiedades', 'Mercado inmobiliario', 'Finanzas'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITIO}/#sitio`,
      url: SITIO,
      name: 'Detrás del Cartel',
      inLanguage: 'es-AR',
      publisher: { '@id': `${SITIO}/#podcast` },
    },
  ],
}
