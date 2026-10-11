# SEGURIDAD — Detrás del Cartel

> Actualizado **2026-09-27** (módulo de consultas: ver `MODULO_CONSULTAS.md` para el detalle de ese módulo). Antes: 21-09. Marco: reglas de seguridad de Vic (globales) + protocolo `AppEcosystem/protocol/04_SECURITY_RULES.md`. Auditado desde el CÓDIGO, no desde documentación.

## Reglas que aplican igual que en el ecosistema
1. Directorio prohibido de iCloud: nunca se accede.
2. Sin tokens, claves ni datos personales en código, logs, commits ni storage público. **Variables de entorno siempre** (la clave de YouTube vive solo en Vercel).
3. `.env` en `.gitignore`. Secretos solo en variables del hosting.
4. **`/security-review` antes de CADA deploy.**
5. Ante la duda entre exponer o no: NO.

## Superficie actual (qué corre y qué recibe datos)
- **Sitio estático** (React) + **dos funciones de servidor**:
  - `GET /api/episodios` — no recibe nada del visitante; lee un canal FIJO de YouTube.
  - `POST /api/consulta` — **sí recibe datos de personas** (el formulario). Ver `MODULO_CONSULTAS.md`.
- **Hay base de datos y login** desde el 27-09: Supabase propio del podcast y Google para entrar a `/consultas`.
- `localStorage` guarda el modo día/noche; la sesión de Supabase la maneja su propia librería.

🔴 **Desde el 27-09 esta web guarda datos personales** (nombre, mail, teléfono y el caso que
cuenta cada persona). Eso cambia el marco: toda revisión de seguridad tiene que incluir el
camino formulario → base → buzón, y los Security Advisors de Supabase entran en la rutina.

## Estado por punto
| Punto | Estado |
|---|---|
| Secretos / tokens / `.env` en código y en el JS publicado | ✅ Ninguno (verificado: 0 apariciones de `AIza`, `YOUTUBE_API_KEY`, `x-goog-api-key` en el bundle ni en la respuesta de la API) |
| Clave de YouTube (`YOUTUBE_API_KEY`) | ✅ Solo en Vercel; validada por formato; enviada por **header** (no por URL); los errores no la incluyen. 🟡 **Confirmar que esté restringida a "YouTube Data API v3"** en Google Cloud |
| XSS | ✅ Sin `dangerouslySetInnerHTML`/`innerHTML`/`eval`. Todo lo que viene de YouTube (título, descripción) se valida, recorta y limpia de caracteres de control, y React lo escapa al mostrarlo. IDs de video validados (`^[A-Za-z0-9_-]{11}$`) en servidor y cliente |
| SSRF / URLs | ✅ Hosts constantes (`googleapis.com`, `youtube.com`). El ID de canal sale de una variable validada (`^UC[A-Za-z0-9_-]{22}$`). Sin redirecciones, timeout 6 s, tope 1 MB |
| Privacidad del contenido | ✅ Solo se muestran videos `public` + `embeddable`. **Probado en vivo:** al pasar el video a Privado, la web lo sacó tras renovarse la caché |
| XXE / parser XML | ✅ El feed de respaldo se procesa con expresiones simples (sin parser XML); DOCTYPE/entidades externas quedan como texto (prueba dedicada) |
| Headers (**`next.config.mjs`** + **`proxy.js`**; eran `vercel.json` hasta el 11-10-2026) | ✅ CSP (`default-src 'self'`, `script-src 'self'`, `connect-src 'self'`, `frame-src https://www.youtube-nocookie.com`, `object-src 'none'`, `frame-ancestors 'none'`…), HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, `X-Robots-Tag: noindex…`. Verificados en vivo: 0 violaciones de CSP |
| Recursos de terceros | ✅ Solo el reproductor `youtube-nocookie.com` (versión sin cookies hasta reproducir). Imágenes y fuentes son propias |
| Enlaces externos | ✅ `target="_blank"` con `rel="noopener noreferrer"`; todos salen de constantes de `siteConfig` |
| Datos personales | 🟢 Desde el 27-09 se recolectan por el formulario, **con las defensas puestas**: validación y escritura solo en el servidor, RLS cerrado, antirrobots (campo trampa + tiempo mínimo), freno de avalancha sin guardar IP, consentimiento explícito para usar el caso al aire, y anonimato garantizado por la base. Detalle y pruebas: `MODULO_CONSULTAS.md`. ✅ **Política de privacidad** publicada en `/privacidad` (27-09), enlazada desde el pie y desde el formulario |
| Claves de Supabase | ✅ La `secret` solo en el servidor (verificado: no aparece en `dist/` ni en el historial de git). La `publishable` viaja al navegador a propósito y no sirve sin sesión autorizada (probado: devuelve vacío) |
| Acceso al buzón `/consultas` | ✅ Login de Google + lista de autorizados en la base. **Probado con otra cuenta: ve 0 consultas, 0 anotaciones, 0 autorizados**, y no puede agregarse a la lista ni modificar nada |
| `npm audit` | ✅ 0 en producción · 🟡 2 en desarrollo (esbuild/vite; solo servidor local; fix = subir Vite, cambio mayor) |
| `noindex` | ✅ 3 capas (meta, `robots.txt`, header). **Quitar solo al lanzar** |
| Contenido de desarrollo fuera de producción | ✅ Barra de dispositivos, `?demo=1`, `logos-preview.html`, logos/banners/portadas sin uso: no llegan al build |

## Aislamiento respecto del ecosistema (decisión Vic, 2026-09-18)
- GitHub, Vercel y Google Cloud en **cuentas distintas** de las que usa Vic para sus otros proyectos.
- **Supabase propio** si hace falta base. Nunca compartir base con otros proyectos.
- El repo tiene `credential.helper` vacío y clave SSH dedicada (no hereda las credenciales globales de la Mac).
- Servidor de desarrollo solo en `127.0.0.1`.

## Revisiones de seguridad hechas (todas: sin hallazgos ≥ 8/10; 5 en total, la última el 22-09 (pie: solo clases de presentación))
1. **2026-09-19** — manual (el skill no corría sin `origin/HEAD`): archivos a subir, dependencias (177 paquetes de `registry.npmjs.org`), build.
2. **2026-09-21** — `/security-review` de la landing completa + función `/api/episodios` + CSP con `frame-src`.
3. ✅ **2026-10-11 — HECHO, con 1 hallazgo corregido.** La migración de Vite a Next está terminada y verificada pero **sin
   publicar**, y el `/security-review` de estos cambios es el paso que falta (el botón de
   publicar no dejaba seguir sin esa constancia).

   🔴 **EL HALLAZGO: la migración se llevó puesta la defensa contra el "reatado de nombres"
   (DNS rebinding), justo la que protegía al endpoint que hace `git push`.** Vite rechazaba de
   plano cualquier pedido cuyo `Host` no reconociera —por eso el 06-10 hubo que agregarle a mano
   los nombres de Tailscale—. **Next no lo hace**: comprobado, contestaba 200 y entregaba el
   token de publicar a un pedido que decía venir de `sitio-del-atacante.com`. El `/token` era
   además la única acción sin ningún control. Con el token, una página reatada leía el estado
   completo del repositorio privado: cada archivo sin confirmar y el texto de cada cambio sin
   subir. El `git push` seguía fuera de alcance (lo frenaba el candado del origen), pero la
   lectura era nueva y alcanzaba. **Corregido** con una lista de nombres permitidos aplicada a
   todas las acciones, `/token` incluida. Verificado: con `Host` ajeno da 403; por localhost y
   por el nombre de Tailscale sigue funcionando.

   ⚠️ **Queda abierto, y NO lo abrió la migración:** desde la red de Tailscale —las propias
   máquinas de Vic— un cliente que no sea un navegador no manda `Origin`, y `permitido()` deja
   pasar cuando falta. Eso sí llega al `git push`. Era idéntico con Vite. Cerrarlo exige
   **obligar** a que venga el `Origin`, y eso puede dejar el botón sin funcionar según el
   navegador (Safari no siempre lo manda en un POST del mismo sitio): es un cambio con su propia
   prueba, no un apéndice de esta migración.

   **Un error de funcionamiento, no de seguridad, encontrado en la misma revisión:**
   `.next-publicar/` —la carpeta donde el botón compila para controlar— no estaba en
   `.gitignore`, y el `git add -A` del propio botón habría subido el compilado entero al
   repositorio **la primera vez que Vic lo apretara**. Corregido antes del primer uso.

   Lo demás que se revisó y quedó limpio:
   - **`proxy.js`** — ahora la CSP se arma en cada visita con un número al azar (nonce) en vez de
     permitir programas sin firma. El `script-src` quedó **igual de restrictivo** que el de
     septiembre (`'self'` + el nonce de esa visita, sin `'unsafe-inline'`), comprobado comparando
     cabecera por cabecera contra lo publicado.
   - **`app/api/publicar-local/[accion]/route.js`** — ⚠️ es lo que más cambió de naturaleza: en
     Vite el botón de publicar **no se compilaba** (`apply: 'serve'`), y ahora **sí se compila y
     sube a Vercel**. Lo único que lo vuelve inofensivo es el `NODE_ENV === 'production'` → 404
     de la primera línea. Verificado en los dos modos. Es el punto a revisar con más cuidado.
   - Los 6 encabezados de seguridad se mudaron de `vercel.json` a `next.config.mjs`: comparados
     uno por uno contra producción, **idénticos**. La CSP también, salvo el nonce.
   - **El nonce**: 16 bytes (128 bits) del generador criptográfico del sistema. Un
     `Content-Security-Policy` o un `x-nonce` mandados por el visitante **no** pueden influirlo
     (`.set()` sobrescribe, no agrega). Ninguna página se sirve sin CSP.
   - **El formulario**: la validación, el campo trampa, el piso de 3 segundos, la lista de tipos
     y el borrado de datos en las anónimas sobrevivieron **idénticos**. La clave secreta se lee
     sólo en `lib/consultas.js`, que únicamente importa la ruta del servidor: no puede llegar al
     navegador. Comprobado además que su valor no aparece en ningún archivo de `.next/` ni en
     ninguno de los 14 cambios del rango.
   - **Secretos en el repositorio**: lo único seguido por git es `.env.example`. El valor de la
     clave secreta aparece en 0 archivos.
   - **El identificador del cambio (SHA) ahora viaja en el HTML** (`generateBuildId`): no es un
     problema, el repositorio es privado y un SHA solo no revela nada.

   🔴 **Y una diferencia entre local y producción que se decidió a propósito** (ver el
   encabezado de `proxy.js`): trabajando, `frame-src` y `frame-ancestors` se aflojan a `'self'`
   para que la barra de desarrollo pueda mostrar las vistas de tablet y celular, que funcionan
   metiendo la página en un marco. **En la web publicada siguen cerradas** (`'none'` y sólo
   youtube-nocookie), verificado contra el compilado de producción. Esto apareció recién ahora
   porque con Vite las cabeceras existían **sólo en producción**: traerlas a local dejó al
   simulador sin marco y Vic lo vio en pantalla.
3. **2026-09-21** — `/security-review` de la lectura por API oficial (clave por header, filtro de privacidad, duración).
- **Pruebas automáticas** (`npm run probar`, **33**): feeds y respuestas de API inventados, incluidos hostiles (scripts en título, IDs inyectados, XXE, entidades absurdas, respuestas gigantes, timeouts, canal inválido, clave con formato raro, errores sin la clave, elementos `null`). Una prueba encontró y corrigió un fallo real.
- **Pruebas en navegador real** con las reglas reales de `vercel.json`: 4 escenarios (con episodios / vacío / API caída / texto hostil): 0 violaciones de CSP, 0 errores de JavaScript, sin desborde horizontal a 390 px.

## Revisión del 22-09 (deploy `e8aacba`) — sin hallazgos ≥ 8/10
Cambios de código revisados: (1) `api/_lib/youtube.js`: un 404 en `playlistItems` se toma como lista vacía y el error lleva `e.status` (el mensaje sigue sin incluir la clave ni la URL); 403/500/timeout siguen cayendo al feed; (2) `src/App.jsx`: enlace público y fijo de Spotify + clase CSS; (3) `src/index.css`: regla del fondo crema. Verificado en vivo tras el deploy: `/api/episodios` HTTP 200 con lista vacía, CSP/HSTS/noindex, 0 violaciones de CSP, sin claves ni ejemplos en el JS publicado.

## Revisión del 27-09 (módulo de consultas) — 1 hallazgo, corregido
**Inyección en el enlace `mailto:` del buzón (MEDIA).** La validación del mail dejaba pasar
`victima@mail.com?bcc=atacante%40evil.com`; al apretar "Responder por mail", el programa de
correo abría el mensaje con **copia oculta a un tercero** y la respuesta a una consulta
privada se le escapaba a alguien de afuera. **Corregido en tres capas** (servidor, pantalla y
restricción `mail_sin_trucos` en la base) y verificado: el ataque rebota, un mail normal pasa.
Lección: **un dato de afuera que va dentro de una dirección se codifica, aunque esté validado.**

🟡 **Deuda:** las políticas usan el mail de la sesión y no el identificador de usuario. Hoy no
es explotable (solo Google habilitado, login por mail apagado). **Si se habilita el login por
mail, pasar las políticas a `auth.uid()` antes.**

## Si se compromete la clave de YouTube
1. Google Cloud → APIs y servicios → Credenciales → **borrar la clave** y crear otra (gratis, restringida a YouTube Data API v3).
2. Vercel → Settings → Environment Variables → editar `YOUTUBE_API_KEY` → **Redeploy**.
3. Mientras tanto la web cae al feed y, si falla, muestra "Muy pronto" (no se rompe).

## Antes de lanzar en serio (checklist)
- [ ] Confirmar restricción de la clave y 2FA de Vercel
- [ ] Quitar `noindex` (3 capas) y hacer pública la cuenta de Instagram. **`/privacidad` debe quedar indexable; `/consultas` NO.**
- [ ] Repetir `/security-review` con el contenido final
- [ ] Conectar el dominio (DNS) y revisar que HTTPS/HSTS funcionen en `detrasdelcartel.com`
- [ ] Revisar promesas públicas (frecuencia de episodios)
- [ ] `git ls-files` sin `.env`, claves ni datos personales
- [x] **Política de privacidad** en la web (hecha el 27-09; mantenerla al día si se agrega analítica o newsletter)
- [ ] Apagar "Allow new users to sign up" en Supabase, después del primer login de cada uno
- [ ] Revisar los **Security Advisors** de Supabase
