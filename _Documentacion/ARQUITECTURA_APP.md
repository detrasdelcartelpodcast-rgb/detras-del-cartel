# ARQUITECTURA — Detrás del Cartel

> Verificado contra el código el 2026-09-18. Si algo cambia, se actualiza acá.

## Qué es
Landing de una página del podcast "Detrás del Cartel" (Daniel Bryn & Víctor Miascovsky). Sitio estático: el build (`npm run build`) genera `dist/` con HTML, JS y CSS. No hay servidor propio.

## Stack
React 18 · Vite 5 · Tailwind 3 (PostCSS) · lucide-react. Sin router, sin estado global, sin llamadas de red.

## Archivos
| Archivo | Rol |
|---|---|
| `src/App.jsx` (~715 líneas) | Toda la página. Arriba, `siteConfig` (editable). |
| `src/DetrasDelCartelLogo.jsx` | Logo vectorial SVG (se usa si `brand.useVectorLogo = true`). |
| `src/InstagramLogoCard.jsx` | Tarjeta de logo para Instagram. No se referencia desde `App.jsx`: verificar antes de borrar. |
| `src/index.css` | Solo las 3 directivas de Tailwind. |
| `public/logo.png` | Logo en uso (`useVectorLogo: false`). |
| `start.command` | Lanzador local (127.0.0.1:5173). |

## `siteConfig` (fuente de verdad del contenido)
- `sections`: interruptor true/false por sección (hero, channels, featuredPlayer, mythAudit, hosts, recentCases, consultationBox, metrics, footer).
- `brand`: títulos, badges, logo.
- `channels`: 4 canales (Spotify, YouTube, Apple, Instagram) con URL.
- Fotos de estudio y conductores: URLs de Unsplash (pendiente pasarlas a `public/`).

## Interacciones y dependencias (relevado desde el código)
- **Salidas de red del navegador:** solo las 3 imágenes de `images.unsplash.com` y los links a los canales (el usuario los abre; no hay `fetch`).
- **Formulario "Enviar Caso":** estado local de React; `handleSubmit` solo hace `setEnviado(true)`. No envía datos.
- **Nada consume esta app ni ella consume a otras.** No hay relación con Tasador, Supabase, Scrapper ni ecosistema.
- **Panel 8002:** solo la lanza (`start.command`).

## Publicación (futuro)
Hosting estático (Vercel) en cuenta propia + repo en GitHub propio. Ver `RUNBOOK.md`.
