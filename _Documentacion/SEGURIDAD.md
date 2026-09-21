# SEGURIDAD — Detrás del Cartel

> Actualizado 2026-09-21. Marco: reglas de seguridad de Vic (globales) + protocolo `AppEcosystem/protocol/04_SECURITY_RULES.md`. Auditado desde el CÓDIGO, no desde documentación.

## Reglas que aplican igual que en el ecosistema
1. Directorio prohibido de iCloud: nunca se accede.
2. Sin tokens, claves ni datos personales en código, logs, commits ni storage público. **Variables de entorno siempre** (la clave de YouTube vive solo en Vercel).
3. `.env` en `.gitignore`. Secretos solo en variables del hosting.
4. **`/security-review` antes de CADA deploy.**
5. Ante la duda entre exponer o no: NO.

## Superficie actual (qué corre y qué recibe datos)
- **Sitio estático** (React) + **una función de servidor**: `GET /api/episodios` (`api/episodios.js`).
- La función **no recibe ningún dato del visitante** (sin parámetros, solo GET/HEAD; POST → 405). Lee un canal FIJO de YouTube.
- **No hay formularios, base de datos, login ni cookies propias.** "Proponé un tema" es un `mailto:` (el correo lo envía el propio programa de correo del visitante).
- `localStorage` guarda solo `light`/`dark` (validado, con `try/catch`).

## Estado por punto
| Punto | Estado |
|---|---|
| Secretos / tokens / `.env` en código y en el JS publicado | ✅ Ninguno (verificado: 0 apariciones de `AIza`, `YOUTUBE_API_KEY`, `x-goog-api-key` en el bundle ni en la respuesta de la API) |
| Clave de YouTube (`YOUTUBE_API_KEY`) | ✅ Solo en Vercel; validada por formato; enviada por **header** (no por URL); los errores no la incluyen. 🟡 **Confirmar que esté restringida a "YouTube Data API v3"** en Google Cloud |
| XSS | ✅ Sin `dangerouslySetInnerHTML`/`innerHTML`/`eval`. Todo lo que viene de YouTube (título, descripción) se valida, recorta y limpia de caracteres de control, y React lo escapa al mostrarlo. IDs de video validados (`^[A-Za-z0-9_-]{11}$`) en servidor y cliente |
| SSRF / URLs | ✅ Hosts constantes (`googleapis.com`, `youtube.com`). El ID de canal sale de una variable validada (`^UC[A-Za-z0-9_-]{22}$`). Sin redirecciones, timeout 6 s, tope 1 MB |
| Privacidad del contenido | ✅ Solo se muestran videos `public` + `embeddable`. **Probado en vivo:** al pasar el video a Privado, la web lo sacó tras renovarse la caché |
| XXE / parser XML | ✅ El feed de respaldo se procesa con expresiones simples (sin parser XML); DOCTYPE/entidades externas quedan como texto (prueba dedicada) |
| Headers (`vercel.json`) | ✅ CSP (`default-src 'self'`, `script-src 'self'`, `connect-src 'self'`, `frame-src https://www.youtube-nocookie.com`, `object-src 'none'`, `frame-ancestors 'none'`…), HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, `X-Robots-Tag: noindex…`. Verificados en vivo: 0 violaciones de CSP |
| Recursos de terceros | ✅ Solo el reproductor `youtube-nocookie.com` (versión sin cookies hasta reproducir). Imágenes y fuentes son propias |
| Enlaces externos | ✅ `target="_blank"` con `rel="noopener noreferrer"`; todos salen de constantes de `siteConfig` |
| Datos personales | ✅ La web no recolecta ninguno. El Gmail del proyecto es público por decisión de Vic. 🔴 **Si algún día se agrega un formulario propio**: backend, validación, antispam, consentimiento y política de privacidad |
| `npm audit` | ✅ 0 en producción · 🟡 2 en desarrollo (esbuild/vite; solo servidor local; fix = subir Vite, cambio mayor) |
| `noindex` | ✅ 3 capas (meta, `robots.txt`, header). **Quitar solo al lanzar** |
| Contenido de desarrollo fuera de producción | ✅ Barra de dispositivos, `?demo=1`, `logos-preview.html`, logos/banners/portadas sin uso: no llegan al build |

## Aislamiento respecto del ecosistema (decisión Vic, 2026-09-18)
- GitHub, Vercel y Google Cloud en **cuentas distintas** de las que usa Vic para sus otros proyectos.
- **Supabase propio** si hace falta base. Nunca compartir base con otros proyectos.
- El repo tiene `credential.helper` vacío y clave SSH dedicada (no hereda las credenciales globales de la Mac).
- Servidor de desarrollo solo en `127.0.0.1`.

## Revisiones de seguridad hechas (todas: sin hallazgos ≥ 8/10)
1. **2026-09-19** — manual (el skill no corría sin `origin/HEAD`): archivos a subir, dependencias (177 paquetes de `registry.npmjs.org`), build.
2. **2026-09-21** — `/security-review` de la landing completa + función `/api/episodios` + CSP con `frame-src`.
3. **2026-09-21** — `/security-review` de la lectura por API oficial (clave por header, filtro de privacidad, duración).
- **Pruebas automáticas** (`npm run probar`, **33**): feeds y respuestas de API inventados, incluidos hostiles (scripts en título, IDs inyectados, XXE, entidades absurdas, respuestas gigantes, timeouts, canal inválido, clave con formato raro, errores sin la clave, elementos `null`). Una prueba encontró y corrigió un fallo real.
- **Pruebas en navegador real** con las reglas reales de `vercel.json`: 4 escenarios (con episodios / vacío / API caída / texto hostil): 0 violaciones de CSP, 0 errores de JavaScript, sin desborde horizontal a 390 px.

## Si se compromete la clave de YouTube
1. Google Cloud → APIs y servicios → Credenciales → **borrar la clave** y crear otra (gratis, restringida a YouTube Data API v3).
2. Vercel → Settings → Environment Variables → editar `YOUTUBE_API_KEY` → **Redeploy**.
3. Mientras tanto la web cae al feed y, si falla, muestra "Muy pronto" (no se rompe).

## Antes de lanzar en serio (checklist)
- [ ] Confirmar restricción de la clave y 2FA de Vercel
- [ ] Quitar `noindex` (3 capas) y hacer pública la cuenta de Instagram
- [ ] Repetir `/security-review` con el contenido final
- [ ] Conectar el dominio (DNS) y revisar que HTTPS/HSTS funcionen en `detrasdelcartel.com`
- [ ] Revisar promesas públicas (frecuencia de episodios)
- [ ] `git ls-files` sin `.env`, claves ni datos personales
