# PLATAFORMAS Y CUENTAS — Detrás del Cartel

> Actualizado **2026-09-21 (madrugada del 22)**. Aquí está el estado de cada plataforma, qué se hizo, qué falta y las trampas de cada una. **No contiene contraseñas ni claves** (Vic las guarda en su gestor; nunca se pegan en el chat ni en el repo). Regla: todas las cuentas son PROPIAS del podcast, separadas de las del ecosistema Inmovalue y de las personales de Vic.

## Enlaces de acceso rápido (guardados a pedido de Vic, 21-09)
- Apple Podcasts Connect (lista de programas): https://podcastsconnect.apple.com/my-podcasts
- Spotify for Creators → Distribución (feed RSS y plataformas): https://creators.spotify.com/pod/show/1ksoLOg5L9V1VlKSNnZz2b/podcast/distribution
- Spotify for Creators (inicio): https://creators.spotify.com/home
- Enlace público del programa en Spotify: https://open.spotify.com/show/1ksoLOg5L9V1VlKSNnZz2b
- Web: https://detras-del-cartel.vercel.app · Canal: https://www.youtube.com/@detrasdelcartelpodcast · Instagram: https://www.instagram.com/detrasdelcartelpodcast/
- ⚠ **Los IDs se copian y pegan, nunca se transcriben de una captura**: el 21-09 se confundió una "l" minúscula con una "I" mayúscula en el ID de Spotify (posición 14: es `l`, código 108) y hubo que corregirlo en el código y la documentación.

## Resumen
| Plataforma | Estado | Falta |
|---|---|---|
| GitHub | 🟡 repo privado. **NO está al día con producción**: `origin/main` = `f0e3f25`, y hay 11 commits locales sin subir | publicar (decisión de Vic) |
| Vercel | ✅ web publicada (noindex) + función + variable de la clave; deploy del 22-09 hecho | conectar dominio; deploy 2 con el enlace de Apple |
| Google Cloud | ✅ proyecto + clave de YouTube Data API v3 | confirmar restricción de la clave |
| YouTube | ✅ canal armado; video de prueba en Privado | subir episodios; alinear frecuencia en banner/descripción |
| Instagram | ✅ cuenta creada, PRIVADA | bio con "lado B", foto de perfil, hacerla pública al lanzar |
| Spotify for Creators | ✅ programa creado y configurado, **sin publicar** | publicar el 1.er episodio (crea el feed RSS) |
| Apple Podcasts Connect | ✅ cuenta activa, **sin programa** | enviar el programa con el feed; anotar el número que asigna Apple |
| Hostinger (dominio) | ✅ **`detrasdelcartel.com` conectado (11-10-2026)** | — |
| Gmail del proyecto | ✅ `detrasdelcartelpodcast@gmail.com` | — |

## GitHub
- Cuenta `detrasdelcartelpodcast-rgb`; repo privado `detras-del-cartel`, rama `main`.
- Acceso por **clave SSH dedicada** (`~/.ssh/id_ed25519_cartel`, alias de host `github-cartel` en `~/.ssh/config`, sin passphrase). Remote: `git@github-cartel:detrasdelcartelpodcast-rgb/detras-del-cartel.git`.
- El repo tiene `credential.helper` vacío e identidad local (email noreply de GitHub) para no heredar las credenciales de la Mac. Cada push a `main` dispara un deploy en Vercel.
- 🔴 **Estado del código (11-10-2026):** producción y GitHub están en **`f0e3f25`** (28-09). El
  código local tiene **11 commits más**, entre ellos la subida de Vite 5→8 / React 18→19 y la
  migración completa a Next 16. Todo verificado contra lo publicado (6 capturas, 0 píxeles de
  diferencia) pero **sin publicar**: el botón exige antes la constancia del `/security-review`.

## Vercel
- Equipo `detrasdelcartel` (cuenta nueva, plan Hobby = solo uso NO comercial; si la web promociona servicios o lleva publicidad hace falta Pro). 2FA: confirmar.
- Proyecto `detras-del-cartel`. 🔴 **En el panel sigue diciendo framework `Vite`, salida `dist`**,
  de cuando la app era Vite. Eso ya no corresponde y **habría roto el próximo deploy** (Next no
  produce `dist`: Vercel compila bien y después no encuentra qué publicar). **No hace falta
  entrar al panel a arreglarlo:** `vercel.json` declara `framework: nextjs` y
  `outputDirectory: null`, y lo del repositorio manda sobre lo del panel. El detalle está en
  `../LEEME_vercel.json.md`.
- Las funciones ya no están en `api/` sino en `app/api/*/route.js`.
- URL actual: `https://detras-del-cartel.vercel.app` (con `noindex`).
- Variable de entorno: **`YOUTUBE_API_KEY`** (Production). Solo aplica a despliegues NUEVOS (hay que redeployar al cambiarla).
- Headers de seguridad en `vercel.json` (CSP con `frame-src https://www.youtube-nocookie.com`, HSTS, etc.).

## Google Cloud (solo aloja la clave)
- Proyecto `detras-del-cartel`, organización "Sin organización", cuenta Gmail del podcast. **No se activó la prueba gratuita de US$300** (no hace falta y pide tarjeta).
- API habilitada: **YouTube Data API v3**. Credencial: clave de API "clave-web-podcast". Restricción de aplicaciones: Ninguna (Vercel no tiene IP fija). **Restricción de API: debe ser solo "YouTube Data API v3"** → *Vic no lo confirmó por escrito: verificar en Credenciales → la clave → Restricciones de API.*
- Costo: **gratis**. Cuota por defecto 10.000 unidades/día por proyecto; cada consulta de la web gasta 2 y se guarda 5 min.
- Si se filtra la clave: borrarla y crear otra (procedimiento en `SEGURIDAD.md`).

## YouTube
- Canal **`@detrasdelcartelpodcast`**, ID `UCRVH9mlcrwMockg7aTbOr-Q`. Teléfono verificado (a confirmar).
- Cargado: nombre, banner 2560×1440 (`src/assets/banners/banner-youtube-2560x1440.png`), descripción del canal con el "lado B", descripción predeterminada de videos (texto fijo + Instagram + aviso "informativo"), país Argentina, categoría Educación, palabras clave, "no es para niños".
- **Video de prueba** `lfogKQdhBMc` ("muy pronto 10s", 11 s, horizontal): sirvió para probar la conexión de la web. **Hoy está en PRIVADO** (a propósito). Se puede borrar o dejar. Miniatura y archivo en `~/Downloads/detras-del-cartel-muy-pronto-*`.
- **Regla para episodios** (la web los toma sola): 16:9, **Público** (privado y no listado no aparecen), título `#N · Título`, descripción con 2 líneas propias ARRIBA (son el resumen) y el texto fijo DEBAJO.
- Frecuencia: **nada que alinear** (Vic, 27-09-2026). Banner y descripción dicen "Nuevos **episodios** todos los meses" —plural: todos los meses hay episodios nuevos—, compatible con el ritmo quincenal previsto. Se deja así.
- Pendiente: marca de agua 150×150 (necesita logo simple), tráiler para no suscriptores, foto de perfil 800×800.

## Instagram
- `@detrasdelcartelpodcast`, hoy **privada** (decisión de Vic hasta lanzar). El botón de la web lleva ahí; para quien no tenga acceso no muestra nada.
- Bio (límite 150 caracteres), opción recomendada (127): "Podcast inmobiliario 🎙️ / El lado B del mercado inmobiliario, en primera persona. / Con Daniel Bryn y Víctor Miascovsky / Proponé un tema 👇". Nombre: "Detrás del Cartel | Podcast inmobiliario". Categoría: Podcast. Enlace: hasta tener dominio, el del canal de YouTube.

## Spotify for Creators (creado el 21-09)
- Se creó con la cuenta de Google del podcast ("Continuar con Google": no tiene contraseña propia de Spotify; entrar siempre por Google). Panel: `creators.spotify.com`.
- **ID del programa `1ksoLOg5L9V1VlKSNnZz2b`** → enlace `https://open.spotify.com/show/1ksoLOg5L9V1VlKSNnZz2b`, **ya pegado en la web** (`siteConfig.channels[spotify].url`). Hoy da "no encontrado" porque el programa no es público; verificar con "Compartir → Copiar enlace al programa" cuando se publique el primer episodio.
- Configurado: nombre "Detrás del Cartel", creador "Daniel Bryn y Víctor Miascovsky", descripción (con el mail del proyecto), categoría Negocios, idioma Español (Argentina), no explícito, portada `~/Downloads/portada-podcast-2000x2000-margen.jpg` (2000×2000, 357 KB, emblema al 68 % para que el recorte no lo toque).
- **NO se publicó ningún episodio a propósito:** un programa recién es público al publicar el primero, y el feed RSS nace ahí. En la búsqueda de Spotify tarda hasta ~1 día en aparecer; por enlace directo, minutos/horas. Spotify permite PROGRAMAR la fecha de publicación de un episodio.
- Feed RSS (después de publicar): Configuración → Disponibilidad → Distribución RSS.
- Video en Spotify: opcional, por episodio (tres puntos → Subir video).
- **Trampas:** (1) la traducción automática de Chrome rompe el botón "Siguiente" y muestra "Algo salió mal" → apagar la traducción; (2) tras crear el programa, un "No tienes acceso a este programa" inicial es una demora de sincronización (recargar/esperar); (3) no crear un segundo programa (duplicados).

## Apple Podcasts Connect (activado el 21-09)
- Cuenta de Apple propia (Gmail del podcast, verificación en dos pasos con **1** teléfono de confianza: conviene sumar un segundo de respaldo). Se pidió cargar datos de pago y domicilio para activarla; **no se cobra nada** (listar un programa por RSS es GRATIS; solo el Apple Podcasters Program, US$19,99/año, es de pago y sirve para suscripciones: NO hace falta).
- Connect: cuenta "Detrás del Cartel", tipo **Particular**, términos aceptados. **Lista de programas VACÍA.**
- Para enviar: Connect → **Añadir programa → con un feed RSS** → pegar el feed de Spotify → Apple lo valida (necesita ≥ 1 episodio publicado) → enviar → revisión de **unos días**.
- **El número/ID del programa lo asigna Apple AL ENVIAR** (se ve en la página del programa en Connect). El enlace final es `https://podcasts.apple.com/ar/podcast/id<NÚMERO>` y es UNO SOLO para todo el programa: los episodios nuevos aparecen solos. Pegarlo en `siteConfig.channels[apple].url` apenas exista (sin esperar la aprobación).
- **Trampas del alta:** (1) "Activate/terminar de activar tu cuenta": hizo falta aceptar el acuerdo de Medios y compras entrando a `podcasts.apple.com` con la cuenta (y a `music.apple.com`), más datos de pago; se destrabó tras unos minutos; (2) el Guardar de "Configurar la cuenta" dio "error, vuelve más tarde" hasta apagar la traducción de Chrome y reintentar; (3) NO usar el iPhone personal para aceptar términos (cambia la cuenta de compras del teléfono); (4) Apple soporta video por HLS vía el proveedor de alojamiento: verificar más adelante si Spotify for Creators lo envía.

## Hostinger (dominio)
- `detrasdelcartel.com` es de Vic, hoy con la página de "dominio estacionado". Sin registros MX (no hay correo). Pendiente: en Vercel → Settings → Domains agregar `detrasdelcartel.com` (y `www`); en Hostinger reemplazar los registros del estacionado por los que indique Vercel (A del dominio, CNAME de `www`). Después verificar HTTPS y actualizar el sitio web que figura en el banner.

## Gmail del proyecto
`detrasdelcartelpodcast@gmail.com`: cuenta de Google del canal, de Google Cloud, de Spotify (por Google), de Apple y contacto público de la web ("Proponé un tema" abre un `mailto:` a esta dirección). Alternativa futura: Google Forms.


---

## 🌐 EL DOMINIO PROPIO — conectado el 11-10-2026

**La dirección del sitio es `https://detrasdelcartel.com`.** `www` redirige ahí con un 308
permanente, y `detras-del-cartel.vercel.app` sigue funcionando.

### Cómo quedó armado

| Dónde | Qué |
|---|---|
| **Vercel → Domains** | `detrasdelcartel.com` conectado a Production · `www.detrasdelcartel.com` con **Redirect 308** a la corta |
| **Hostinger → DNS** | `A` `@` → `216.198.79.1` · `CNAME` `www` → `281ef29e7df6e947.vercel-dns-017.com.` · los dos con TTL 300 |
| **Nameservers** | **Siguen en Hostinger** (`lunar`/`solar.dns-parking.com`). Se cambiaron sólo los registros, para no perder el control del DNS si algún día hace falta correo en el dominio |
| **Certificado** | Let's Encrypt, emitido solo por Vercel a los ~10 segundos del cambio de DNS |

### 🔴 Las tres trampas de este trámite

1. **El orden entre el apex y el www.** Vercel configuró solo `detrasdelcartel.com` → 308 → `www`,
   que es al revés de lo que se quería. Para darlo vuelta hay que hacerlo **en este orden**:
   primero poner el apex en *Connect to an environment → Production*, y **después** poner el www
   en *Redirect to Another Domain*. Al revés —www apuntando al apex mientras el apex todavía
   apunta al www— queda un **bucle** y no abre ninguna de las dos.
2. **El Site URL de Supabase se cambia AL FINAL**, cuando el dominio ya responde. Antes, deja el
   buzón sin login por ninguna de las dos direcciones.
3. **Hay que agregar la dirección de Vercel a los Redirect URLs de Supabase.** Hasta ese día
   funcionaba *porque era el Site URL*, y Supabase lo permite automáticamente. Al cambiar el
   Site URL al dominio nuevo, la vieja deja de estar permitida y el login por ahí se corta sin
   que nada lo avise.

### Lo que NO hizo falta tocar
**Google Cloud.** El login vuelve a `…supabase.co/auth/v1/callback`, no al dominio del sitio, así
que el cambio no lo afecta. Verificado interceptando el salto a Google desde las dos direcciones.

### Verificado desde afuera el 11-10-2026
Las 3 páginas y el endpoint en 200 por el dominio nuevo · `www` devuelve 308 a la corta ·
certificado válido hasta el 9-1-2027 · las 4 cabeceras de seguridad llegan iguales que antes ·
el botón de Google salta bien **por las dos direcciones**.

### Pendiente
- `siteConfig.contact.website` y el `WEB` del botón de publicar ya apuntan al dominio nuevo.
- **El `noindex` se mantiene**: el podcast todavía no lanzó. Al lanzar hay que sacarlo de las
  tres capas (ver el HANDOVER), dejando `/privacidad` indexable y `/consultas` nunca.
