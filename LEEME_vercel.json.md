# Por qué `vercel.json` dice lo que dice

`vercel.json` no admite comentarios: su esquema tiene `additionalProperties: false`, así que
cualquier clave que Vercel no conozca —incluida una puesta a propósito para explicar algo—
hace que el archivo sea inválido y el deploy no arranque. Por eso la explicación vive acá.

## Las dos líneas que tiene, y qué pasa si se borran

```json
"framework": "nextjs",
"outputDirectory": null
```

🔴 **Estas dos líneas son lo único que evita que el próximo deploy salga roto.**

El proyecto en el panel de Vercel se creó en la época de Vite y quedó guardado así:
framework **Vite**, salida **`dist`**. Desde el 11-10-2026 la app es Next, que no produce
`dist` sino `.next`, y que además necesita que Vercel la trate como Next (funciones,
`proxy.js`, páginas que se arman en el pedido) y no como una carpeta de archivos sueltos.

Sin estas dos líneas, Vercel compila **bien** y después no encuentra qué publicar. Es el peor
tipo de falla: el registro del deploy no muestra ningún error de código.

Lo que se declara en `vercel.json` **manda sobre lo que dice el panel** — está escrito en la
documentación de Vercel, en las propiedades `framework` y `outputDirectory`: *«This value
overrides the Framework / the Output Directory in Project Settings»*. Por eso se arregla desde
el repositorio y no hace falta entrar al panel. El `null` es a propósito: es la forma de
**deshacer** el `dist` que quedó guardado allá.

## Lo que ANTES estaba en `vercel.json` y ya no, con el motivo

| Qué había | Por qué se fue |
|---|---|
| `rewrites` | `/consultas` y `/privacidad` apuntaban a `index.html`, porque con Vite había **una sola página** y el ruteo lo hacía el navegador. Ahora son páginas de verdad: si los rewrites se quedaran, **taparían** a las nuevas. |
| `headers` (los 6 de seguridad) | Se mudaron a `next.config.mjs`, para que valgan **también en localhost**. Antes existían sólo en producción y las diferencias aparecían recién al publicar. |
| `Content-Security-Policy` | La escribe **`proxy.js`**, porque tiene que cambiar en cada visita (ver el encabezado de ese archivo). ⚠️ **No volver a ponerla acá ni en `next.config.mjs`:** el navegador recibiría dos y aplicaría la intersección de las dos, que es la forma más confusa que hay de romper un sitio. |

## Lo que sigue en el panel de Vercel y no se puede mover acá

- **`YOUTUBE_API_KEY`** (variable de entorno, sólo Production). Al cambiarla hay que volver a
  publicar: las variables se leen cuando se compila.
- El **dominio** (`detrasdelcartel.com`, hoy estacionado en Hostinger).
