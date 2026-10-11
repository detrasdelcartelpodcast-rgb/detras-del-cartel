# ARQUITECTURA — Detrás del Cartel

> Verificado contra el código el **2026-10-11**, después de migrar de Vite a Next.
> ⚠️ **Producción NO es igual al código local:** la web en vivo está en `f0e3f25` (28-09) y hay
> 11 commits locales sin subir, la migración entre ellos. Publicar es decisión de Vic.

## Qué es
Landing de una página del podcast "Detrás del Cartel" (Daniel Bryn y Víctor Miascovsky) + una función de servidor que lee los episodios del canal de YouTube. Objetivo: **mantenimiento mínimo**.

## Stack
**Next 16.4** (App Router) · React 19 · Tailwind 3 (colores por variables CSS, modo día/noche) ·
lucide-react · Supabase (base propia, ver `MODULO_CONSULTAS.md`) · desplegada en Vercel.

🔴 **Era Vite 5 + React 18 hasta el 11-10-2026.** Se migró a Next para que el HTML salga del
servidor ya escrito: con Vite, el buscador (y las IA que citan páginas) recibían una página
vacía que se rellenaba después en el navegador. Medido: de un HTML casi vacío con 1 mención del
podcast a **30.843 bytes con 2.708 caracteres de texto real y 3 menciones**. El momento se
eligió por estar la app todavía sin uso (Vic, 11-10-2026): migrarla crecida cuesta más.

**Tailwind sigue en 3 a propósito.** Pasar a 4 se probó y se volvió atrás: compilaba bien pero
el encabezado crecía 31 px (6,9 % de píxeles distintos) y el parche oficial de compatibilidad
no alcanzaba, porque la app define los colores de borde a mano. Es una tarea aparte (~2 h).

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
| `app/layout.jsx` | El armazón de todas las páginas (reemplaza al `index.html` de Vite): título, `noindex`, hoja de estilos. 🔴 Tiene el `force-dynamic` que hace posible la CSP: ver `proxy.js` |
| `app/page.jsx` · `app/consultas/page.jsx` · `app/privacidad/page.jsx` | Las tres páginas. Antes el ruteo lo hacía `src/main.jsx` leyendo la dirección en el navegador |
| `app/api/episodios/route.js` | `GET /api/episodios`. Caché de CDN 5 min (+ hasta 1 h de dato viejo si falla). 405 si no es GET/HEAD |
| `app/api/consulta/route.js` | `POST /api/consulta`. Ver `MODULO_CONSULTAS.md` |
| `app/api/publicar-local/[accion]/route.js` | El botón de publicar. **404 en producción.** ⚠️ No renombrarlo con guión bajo adelante: Next ignora esas carpetas y el endpoint desaparece sin dar error |
| `lib/youtube.js` | Lógica: API oficial (principal) + feed (respaldo); validación y limpieza de todos los campos |
| `lib/consultas.js` | Validación y guardado de las consultas. Corre sólo en el servidor |
| `proxy.js` | 🔴 Escribe la `Content-Security-Policy`, que cambia en cada visita. **Leerlo antes de tocar cualquier cabecera.** En Next 16 este archivo se llama `proxy.js`; hasta la 15 era `middleware.js` |
| `next.config.mjs` | Las otras 6 cabeceras de seguridad, los hosts de Tailscale, la huella de la versión y la carpeta de compilado |
| `vercel.json` | **Sólo** `framework: nextjs` + `outputDirectory: null`. El motivo, en `LEEME_vercel.json.md` |
| `tools/probar-episodios.mjs` | `npm run probar` (33 pruebas) |
| `tools/componer-banner-youtube.py` | Regenera el banner de YouTube desde una imagen de Stitch |
| `logos-preview.html` | Vista previa de logos, solo dev |
| `start.command` | Lanzador local (127.0.0.1:5173), usado por el panel 8002. ⚠️ No agregarle banderas de puerto: van en el `dev` de `package.json`, y las de Vite (`--strictPort`) rompen Next |
| `public/` | `logo.png` (vista en construcción), `robots.txt` (Disallow) |

## Detalles de implementación que conviene saber
- **Modo día/noche:** variables CSS en `src/index.css` (`:root` = noche, `:root.light` = día) mapeadas a colores de Tailwind (`bg-card`, `text-fg`, `text-muted`, `border-line/10`, `text-accent`…). Clase **`tarjeta-portada`** (portada): en modo día fuerza fondo crema `#FBF8F1` y borde dorado suave (`:root.light .tarjeta-portada`, mayor especificidad que las utilidades de Tailwind); modo noche sin cambios.
- **Columna única:** `main` con `max-w-4xl` (~896 px) en todos los dispositivos. Decisión de Vic: no hacer un formato distinto para escritorio.
- **Canales:** `siteConfig.channels[]` con `url`; `url: ""` = tarjeta apagada "PRÓXIMAMENTE" sin enlace; con `url` = enlace activo. El pie lista solo los canales con `url`.
- 🔴 **El puerto se declara con `-H 127.0.0.1`** en los dos comandos de `package.json`. Vite
  escuchaba sólo en localhost por su cuenta; **Next, si no se le dice, escucha en todas las
  interfaces**, y la app quedaría visible para cualquiera en la red donde esté la Mac. Además
  choca con `tailscale serve`, que ya tiene tomado el 5173 del tailnet.
- **API de episodios (`lib/youtube.js`):** `obtenerEpisodios()` → si hay `YOUTUBE_API_KEY` válida (`^[A-Za-z0-9_-]{30,60}$`) usa la API v3 (`playlistItems` sobre `UU`+canal, luego `videos?part=snippet,contentDetails,status`); un **404 en `playlistItems` (canal sin videos públicos) se toma como lista vacía**; 403/500/timeout/respuesta gigante caen al feed; si el feed también falla, la función lanza y `episodios.js` responde 502 (la web muestra "Muy pronto"). La clave va por header `x-goog-api-key`. Filtro: `privacyStatus=public` y `embeddable=true`. Salida: `{id, titulo, fecha, resumen, duracion}`.

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
- **Vercel:** hosting + funciones + variable `YOUTUBE_API_KEY`. **GitHub:** repo privado (cuenta
  propia del podcast, con su propio alias de SSH `github-cartel`); cada push a `main` redespliega.
  🔴 El panel de Vercel **todavía dice framework Vite con salida `dist`**: lo corrige `vercel.json`
  desde el repo. Ver `LEEME_vercel.json.md`.
- **Google Cloud:** solo aloja la clave de API.
- **Nada consume esta app ni ella consume otras del ecosistema.** El panel 8002 solo la lanza en local.
- **Enlaces salientes:** YouTube, Instagram, `mailto:` al Gmail del proyecto.

## Modos de la web publicada
- `sitio.publicarCompleto = true` (hoy): landing completa.
- `sitio.publicarCompleto = false`: solo logo + barra roja "SITIO EN CONSTRUCCIÓN" (volver a esto si hace falta ocultar todo rápido: cambiar el valor y hacer push).

## Módulo de consultas (27-09-2026)
La landing dejó de ser 100 % estática: ahora hay **base de datos propia** (Supabase), una
función `POST /api/consulta` que recibe el formulario y una segunda página, `/consultas`, con
login de Google. Arquitectura, tablas, permisos y seguridad: **`MODULO_CONSULTAS.md`**.

📌 Actualizado el 11-10-2026: el ruteo ya no lo hace `src/main.jsx` leyendo la dirección, sino
Next, con una carpeta por página. El buzón sigue viajando en un paquete aparte que sólo descarga
quien entra ahí, pero ahora **lo separa Next solo**: ya no hace falta el `React.lazy()` que
estaba escrito a mano.
