# ARQUITECTURA — Detrás del Cartel

> Verificado contra el código el 2026-09-21 (noche). Producción = commit `742f75a`; el código local tiene 6 commits más pendientes de deploy (ver `HANDOVER.md`).

## Qué es
Landing de una página del podcast "Detrás del Cartel" (Daniel Bryn y Víctor Miascovsky) + una función de servidor que lee los episodios del canal de YouTube. Objetivo: **mantenimiento mínimo**.

## Stack
React 18 · Vite 5 · Tailwind 3 (colores por variables CSS, modo día/noche) · lucide-react · función serverless de Vercel (Node). Sin base de datos, sin login, sin formularios.

## Archivos
| Archivo | Rol |
|---|---|
| `src/App.jsx` | Toda la página. Arriba, `siteConfig` (textos, canales, secciones, bios, "Juntos", buzón, contacto). **Es el lugar donde se edita el contenido.** |
| `src/Episodios.jsx` | `useEpisodios` (pide `/api/episodios`), `UltimoEpisodio` (reproductor + datos, o "Muy pronto"), `EpisodiosAnteriores` (desde el 2.º video). `?demo=1` solo en dev |
| `src/Construccion.jsx` | Vista "en construcción" (logo + barra roja). Se usa si `siteConfig.sitio.publicarCompleto = false` (o `?produccion=1` en localhost) |
| `src/theme.js`, `src/ThemeToggle.jsx` | Modo día/noche (respeta el del dispositivo; recuerda la elección) |
| `src/MiniMark.jsx` | Marca chica (cartel + micrófono) provisoria para menú y pie |
| `src/dev/DevSimulator.jsx` | Barra flotante de dispositivos. **Solo dev**, no llega al build |
| `src/assets/hosts/` | Fotos de los conductores (400 px) |
| `src/assets/logos/` | Inventario de logos (`LEEME.md`); el que se usa: `12-emblema-cobrizo-final-TRANSPARENTE-764.webp` |
| `src/assets/banners/`, `src/assets/covers/` | Banner de YouTube 2560×1440 y portadas 3000×3000 (para subir a las plataformas; NO se publican en la web) |
| `api/episodios.js` | Función `GET /api/episodios`. Caché de CDN 5 min (+ hasta 1 h de dato viejo si falla). 405 si no es GET/HEAD |
| `api/_lib/youtube.js` | Lógica: API oficial (principal) + feed (respaldo); validación y limpieza de todos los campos |
| `vite.config.js` | Plugin que descarta del build imágenes sin uso + plugin `apiLocal` (sirve `/api/episodios` en localhost con el mismo código) |
| `vercel.json` | Headers de seguridad (CSP, HSTS…) y `noindex` |
| `tools/probar-episodios.mjs` | `npm run probar` (33 pruebas) |
| `tools/componer-banner-youtube.py` | Regenera el banner de YouTube desde una imagen de Stitch |
| `logos-preview.html` | Vista previa de logos, solo dev |
| `start.command` | Lanzador local (127.0.0.1:5173), usado por el panel 8002 |
| `public/` | `logo.png` (vista en construcción), `robots.txt` (Disallow) |

## Detalles de implementación que conviene saber
- **Modo día/noche:** variables CSS en `src/index.css` (`:root` = noche, `:root.light` = día) mapeadas a colores de Tailwind (`bg-card`, `text-fg`, `text-muted`, `border-line/10`, `text-accent`…). Clase **`tarjeta-portada`** (portada): en modo día fuerza fondo crema `#FBF8F1` y borde dorado suave (`:root.light .tarjeta-portada`, mayor especificidad que las utilidades de Tailwind); modo noche sin cambios.
- **Columna única:** `main` con `max-w-4xl` (~896 px) en todos los dispositivos. Decisión de Vic: no hacer un formato distinto para escritorio.
- **Canales:** `siteConfig.channels[]` con `url`; `url: ""` = tarjeta apagada "PRÓXIMAMENTE" sin enlace; con `url` = enlace activo. El pie lista solo los canales con `url`.
- **API de episodios (`api/_lib/youtube.js`):** `obtenerEpisodios()` → si hay `YOUTUBE_API_KEY` válida (`^[A-Za-z0-9_-]{30,60}$`) usa la API v3 (`playlistItems` sobre `UU`+canal, luego `videos?part=snippet,contentDetails,status`); un **404 en `playlistItems` (canal sin videos públicos) se toma como lista vacía**; 403/500/timeout/respuesta gigante caen al feed; si el feed también falla, la función lanza y `episodios.js` responde 502 (la web muestra "Muy pronto"). La clave va por header `x-goog-api-key`. Filtro: `privacyStatus=public` y `embeddable=true`. Salida: `{id, titulo, fecha, resumen, duracion}`.

## Flujo de los episodios
```
Vic sube video a YouTube (público, 16:9)
   → Vercel: GET /api/episodios (caché 5 min)
        → API v3: playlistItems (lista de subidas "UU"+canal) + videos?part=snippet,contentDetails,status   [clave YOUTUBE_API_KEY por header]
        → filtra: privacyStatus=public y embeddable=true; limpia y recorta campos; máx. 12; duración
        → si la API falla o no hay clave: feed público videos.xml (hoy roto por YouTube)
   → Episodios.jsx: 1.º = "Último episodio" (iframe youtube-nocookie), resto = "Episodios anteriores"
   → sin videos o error: tarjeta "Muy pronto: el primer episodio"
```
Cuota de la API: 2 unidades por consulta; cuota gratuita por defecto 10.000/día por proyecto.

## Interacciones y dependencias (relevadas desde el código)
- **YouTube** (canal `UCRVH9mlcrwMockg7aTbOr-Q`): fuente de episodios y reproductor. Sin YouTube la web sigue en pie mostrando "Muy pronto".
- **Vercel:** hosting + función + variable `YOUTUBE_API_KEY`. **GitHub:** repo privado; cada push a `main` redespliega.
- **Google Cloud:** solo aloja la clave de API.
- **Nada consume esta app ni ella consume otras del ecosistema.** El panel 8002 solo la lanza en local.
- **Enlaces salientes:** YouTube, Instagram, `mailto:` al Gmail del proyecto.

## Modos de la web publicada
- `sitio.publicarCompleto = true` (hoy): landing completa.
- `sitio.publicarCompleto = false`: solo logo + barra roja "SITIO EN CONSTRUCCIÓN" (volver a esto si hace falta ocultar todo rápido: cambiar el valor y hacer push).
