# HANDOVER — Detrás del Cartel

> Última actualización: **2026-09-22 (01:20)**. Reescrito completo con el estado real; el deploy del 22-09 ya está hecho y verificado. Falta solo lo de abajo. La bitácora anterior está en el historial de git.
> App **INDEPENDIENTE** del ecosistema Inmovalue: no comparte repo, base, cuentas ni credenciales. Solo cumple las mismas reglas de seguridad.
> Documentos hermanos: `PLATAFORMAS.md` (cada cuenta, IDs y trampas) · `ARQUITECTURA_APP.md` · `SEGURIDAD.md` · `RUNBOOK.md` (operación y día de lanzamiento) · `../src/assets/logos/LEEME.md` (inventario de logos).

## 🚨 ZONA PROHIBIDA
- **Directorio prohibido de iCloud (carpeta "C"):** ningún proceso lo toca (regla global de Vic).
- **NO usar las cuentas del ecosistema** (GitHub/Vercel/Supabase de Inmovalue) ni las personales de Vic para esta app. Cuentas propias del podcast (ver `PLATAFORMAS.md`).
- **NO conectar esta app a ninguna base de datos de otros proyectos.** Si necesita base, una propia.
- Nunca subir `.env`, claves, tokens ni datos de personas al repo. **La clave de YouTube vive SOLO en Vercel.**
- **`/security-review` antes de CADA deploy** (regla fija de Vic). Hecho 4 veces (la última el 22-09, antes del deploy de `e8aacba`, sin hallazgos).
- **No modificar código ni publicar sin OK de Vic.** Proponer primero, mostrar en `localhost:5173`, recién ahí publicar. Lección del 20-09: cuando Vic pidió cambiar un TEXTO, se rediseñó el bloque por iniciativa propia y hubo que deshacerlo.
- **NUNCA transcribir IDs o enlaces desde una captura de pantalla** (Lección del 21-09: al copiar a mano el ID de Spotify confundí una "l" minúscula con una "I" mayúscula; el botón de la web habría quedado roto incluso con el programa publicado). Pedir siempre que Vic **copie y pegue el texto**, y comparar carácter por carácter.

## 🔴 ESTADO ACTUAL (21-09-2026, noche)

### Producción = local (deploy hecho el 22-09 a las 01:14 ART)
Producción (`https://detras-del-cartel.vercel.app`) está en el commit **`e8aacba`**, igual que el código local. Se subieron: fondo **crema** de la tarjeta de portada en modo día · corrección **404 → lista vacía** en la API · enlace de **Spotify** activo · documentación. **Verificado en vivo:** página HTTP 200 · `/api/episodios` → **HTTP 200 `{"ok":true,"episodios":[]}`** (antes daba 502: **el fix quedó confirmado**) · CSP/HSTS/`noindex` presentes · 0 violaciones de CSP y 0 recursos rotos en modo día y noche · sin desborde a 1280 px · el JS publicado contiene el enlace de Spotify correcto y 0 ejemplos/0 claves · el CSS publicado tiene la regla del crema. Tarjeta de Spotify **activa** (lleva a "no encontrado" hasta publicar el 1.er episodio); tarjeta de Apple "Próximamente".

### 🚀 DEPLOY 2 PENDIENTE (solo el enlace de Apple)
**Cuándo:** cuando se haya publicado el primer episodio y se haya enviado el programa a Apple (Apple asigna el número al enviar). **Qué:** pegar el enlace de Apple en `siteConfig.channels` (`id: "apple"`, campo `url`). **Cómo:** `npm run probar` (33 OK) → `npm run build` → `/security-review` → `git push origin main` → verificar en vivo (tarjeta de Apple activa y enlace correcto; `/api/episodios` con el episodio). Detalle en `RUNBOOK.md` → "Día de lanzamiento".

### Lo que falta de Apple (para pegar en la web)
El **enlace de Apple no existe todavía**: el número lo asigna Apple **al enviar el programa**, y para enviarlo hace falta el feed con ≥ 1 episodio. Es UN solo enlace para todo el programa (`https://podcasts.apple.com/ar/podcast/id<NÚMERO>`); los episodios nuevos aparecen solos. Apenas se envíe, pedir a Vic el número (o el enlace copiado del navegador) y pegarlo **sin esperar la aprobación**.

### Enlaces de acceso rápido (guardados a pedido de Vic, 21-09)
- **Apple Podcasts Connect (lista de programas):** https://podcastsconnect.apple.com/my-podcasts
- **Spotify for Creators → Distribución (feed RSS y plataformas):** https://creators.spotify.com/pod/show/1ksoLOg5L9V1VlKSNnZz2b/podcast/distribution
- **Spotify for Creators (inicio del programa):** https://creators.spotify.com/home
- **Enlace público del programa en Spotify (ya pegado en la web):** https://open.spotify.com/show/1ksoLOg5L9V1VlKSNnZz2b (da "no encontrado" hasta publicar el 1.er episodio)
- **Web publicada:** https://detras-del-cartel.vercel.app · **API:** https://detras-del-cartel.vercel.app/api/episodios
- **Canal de YouTube:** https://www.youtube.com/@detrasdelcartelpodcast · **Instagram:** https://www.instagram.com/detrasdelcartelpodcast/ (privada)
- **Repo:** GitHub `detrasdelcartelpodcast-rgb/detras-del-cartel` (privado)

### Qué hay hecho en la web (todo verificado)
| Bloque | Estado |
|---|---|
| Menú (mini logo, nombre, "Escuchar" → baja al episodio, día/noche) | ✅ |
| Portada: emblema cobrizo + "EL LADO B DEL MERCADO INMOBILIARIO" + texto (tarjeta crema en modo día) | ✅ en producción |
| Dónde escucharnos: YouTube, Instagram y Spotify activos; Apple "Próximamente" | ✅ / 🟡 (Apple espera el enlace) |
| **Último episodio automático desde YouTube** | ✅ probado en vivo: público → apareció solo; privado → desapareció (~5 min de caché) |
| Mito o realidad (texto fijo) | ✅ (redactado por Claude; lo valida Vic) |
| Los Conductores: fotos, bios, franja y "Juntos" | ✅ (Daniel debe validar) |
| Episodios anteriores (automático desde el 2.º video) | ✅ sin datos reales todavía |
| Proponé un tema (`mailto:` al Gmail del proyecto) | ✅ |
| Pie · Barra inferior del celular · Modo día/noche · `noindex` · Headers de seguridad | ✅ |

**Localhost:** mismo código + barra flotante de dispositivos (solo dev) + `?demo=1` (episodios de ejemplo) + `?produccion=1` (vista "en construcción").

### Plataformas (resumen; detalle y trampas en `PLATAFORMAS.md`)
- **Spotify for Creators:** programa creado y configurado, **sin ningún episodio publicado a propósito** (recién es público al publicar el 1.º; el feed RSS nace ahí). Portada `~/Downloads/portada-podcast-2000x2000-margen.jpg`.
- **Apple Podcasts Connect:** cuenta activa, tipo Particular, **lista vacía**; gratis por RSS.
- **YouTube:** canal armado, banner y descripción cargados; video de prueba `lfogKQdhBMc` en **Privado**.
- **Instagram:** privada. **Dominio `detrasdelcartel.com`:** estacionado en Hostinger, sin conectar. **Google Cloud:** proyecto + clave (restricción por confirmar).

## 🎯 OBJETIVO Y CRITERIOS (decisiones de Vic)
- **Landing de un PODCAST con el MÍNIMO mantenimiento posible.** Todo lo que cambia solo (episodios, contador, fechas) se lee de YouTube; lo escrito a mano es lo mínimo (textos fijos + el "Mito").
- **Esta web INFORMA, no ofrece servicios.** Los servicios de Vic y Daniel viven en sus propias webs. Nada de "te acompaño / te ayudo / auditoría gratuita". Evitar "tasar/tasación", "avisos" (decir "oferta"), "gratis" (decir "sin costo"), acusaciones o alusiones a colegas ("hay de todo" va implícito).
- **Ancho / formato (Vic, 21-09): UNA sola columna centrada de ~900 px (`max-w-4xl`) en celular, tablet y computadora. NO hacer un formato distinto para escritorio** (es lo habitual en webs de podcasts y lo más simple de mantener). Ya se evaluó y se descartó reorganizar para pantallas grandes.
- **Voz:** segunda persona, voseo, cálida, sin títulos colgados. Los conductores son contadores analíticos; matiz: Daniel = mercado y datos (además corredor inmobiliario), Víctor = negociación y finanzas (consultor inmobiliario). Las dos bios deben ocupar el MISMO espacio (2 líneas + 2 de destacado).
- **Idea rectora:** una casa no es un producto de consumo masivo; se decide con emoción y se justifica con razón. **"Detrás del cartel" = el lado B del mercado inmobiliario.**
- **Oyente tipo:** quien va a vender (familia que crece / que se achica), quien invierte y teme dejarse llevar, herederos que no saben si vender o alquilar; en todos, desconfianza hacia el mercado. Los oyentes proponen temas y se desarrollan en episodios.
- **Mismo logo en todos lados** (la rotación de logos se descartó). Emblema cobrizo con "EN VENTA" y "REAL ESTATE PODCAST" tal cual (decisión de Vic). Para tamaños chicos (menú, favicon, marca de agua) se necesita una versión simple.

### Textos aprobados por Vic (se editan en `siteConfig` de `src/App.jsx`)
- **Portada:** "EL LADO B DEL MERCADO INMOBILIARIO" / "Tips y casos reales, en primera persona. Lo que hay detrás del cartel, explicado sin vueltas."
- **Conductores:** etiqueta "DETRÁS DEL MICRÓFONO", título "Los Conductores", subtítulo "Una forma distinta de contar el mercado inmobiliario: con empatía y con oficio en las negociaciones difíciles." Franja: "+20 años acumulados asesorando y auditando operaciones, con mirada financiera: para decidir con datos y más certeza, no con presentimientos. No lo tomamos a la ligera: sabemos que lo que está en juego es tu patrimonio." (No repetir esto en otros bloques.)
- **Bios:** Daniel "Contador y corredor inmobiliario. Escucha cada caso antes de opinar y lo explica con datos." + "En cada episodio traduce los números del mercado a lenguaje claro." · Víctor "Contador y consultor inmobiliario. Escucha cada caso antes de opinar y lo analiza con números." + "En cada episodio explica cómo se negocia una operación y qué hay detrás de cada cifra."
- **Juntos** (recuadro único, formato aprobado; NO dos columnas ni preguntas/respuestas): "Sabemos que te mudás pocas veces en la vida y que hay mucho en juego: una familia que creció, una herencia, un cambio de vida, una inversión que da miedo. Se decide con emoción y después se justifica con la razón. Acá hablamos de las dos cosas, con información clara y tips para que lo transites con la mayor certeza posible. Por eso te contamos, en primera persona, todo lo que hay DETRÁS DEL CARTEL…" + etiquetas (precio, negociación, papeles, herencias, inversión, miedo, frustración, malas experiencias, desconocimiento, desconfianza, procrastinación).
- **Proponé un tema:** "¿Qué querés que hablemos en el podcast?" + botón "Contanos tu caso" (`mailto:` con asunto y cuerpo prearmados).

## ⚙️ CÓMO SE ACTUALIZA SOLO (episodios)
`Vercel /api/episodios` → YouTube Data API v3 (clave `YOUTUBE_API_KEY`) → caché 5 min → `src/Episodios.jsx`. Muestra videos **públicos e insertables** del canal (máx. 12). Título `#5 · Algo` → "Nº 5". **Resumen = las 2 primeras líneas de la descripción del video** (escribir ARRIBA 2 líneas propias y DEBAJO el texto fijo del canal). Muestra la duración ("fecha · 0:11": es la DURACIÓN, no la hora). Si la API falla o falta la clave, cae al feed público (`videos.xml`), que YouTube rompió el 1-3 sep 2026; si todo falla → "Muy pronto". Un video privado o no listado NO aparece (a propósito). Detalle técnico en `ARQUITECTURA_APP.md`.

## 🔴 TRAMPAS Y LECCIONES
- **IDs y enlaces: nunca transcribirlos desde una captura** (I mayúscula / l minúscula / 1 / O / 0 se confunden). Ver "Zona prohibida".
- **La traducción automática de Chrome rompe los formularios de Spotify y de Apple** (botones "Siguiente"/"Guardar" que no responden o dan "Algo salió mal"). Apagarla ("Mostrar original") y recargar.
- **Código que entrega Stitch/Gemini "en React/SVG" NO es fiel al diseño** (es una recreación imprecisa). La fuente de verdad es la IMAGEN. En Stitch: Exportar → `.zip` → `screen.png` (1024 px, sin transparencia; siempre se llama igual: renombrar).
- **Las imágenes pegadas en el chat NO quedan en disco.** Pedir siempre el archivo (Descargas + ruta).
- **Un canal sin videos públicos hace que la API de YouTube (`playlistItems`) conteste 404.** Corregido (lista vacía); confirmar en vivo tras el deploy.
- **Fotos de conductores, logos y portadas sin uso** viven en `src/assets/`; un plugin de `vite.config.js` descarta del build las imágenes que ningún código publicado usa (verificado en ambos sentidos).
- **Datos de ejemplo del prototipo** (`?demo=1`) van envueltos en `import.meta.env.DEV`: no viajan a producción.
- **Colores:** en secciones nuevas usar SIEMPRE los colores del tema (`bg-card`, `text-fg`, `text-muted`, `border-line/10`, `text-accent`…), nunca `text-white` ni hex fijos.
- **Caché:** los cambios en YouTube tardan hasta ~5 min en verse (y hasta 1 h de dato viejo si YouTube falla).
- **Puerto 5173:** si otro proyecto Vite lo ocupa, `start.command` falla por `--strictPort`.
- **Vercel Hobby es solo para uso no comercial.**
- **No usar el iPhone personal para aceptar términos de Apple** (cambia la cuenta de compras del teléfono).

## 🟡 PENDIENTES (por prioridad)
0. **Deploy 2** (ver arriba): solo el enlace de Apple, cuando exista. (El deploy 1 —crema, fix de la API y enlace de Spotify— ya está hecho.)
1. **Confirmar la restricción de la clave** de Google Cloud (solo "YouTube Data API v3") y el 2FA de la cuenta de Vercel; sumar un 2.º teléfono de confianza a la cuenta de Apple.
2. **Decidir la frecuencia** ⚠: la propuesta del podcast (memoria del 17-08) es **quincenal**, 12 episodios en 6 meses, 20-25 min; el banner ("todos los meses"/una versión "cada semana") y la descripción del canal dicen mensual. Alinear banner (regenerable con `tools/componer-banner-youtube.py`), descripción del canal y la del video.
3. **Grabar el primer episodio** (recomendado: 2-3 juntos, o un tráiler de 30-60 s). Subir a Spotify (audio; video opcional) y a YouTube (público, 16:9, `#1 · …`, 2 líneas de resumen arriba). Pasar el video de prueba a borrar.
4. **Enviar el programa a Apple** el mismo día (Connect → Añadir programa → feed RSS de Spotify: Configuración → Disponibilidad → Distribución RSS). Aprobación: días. Pedir el número que asigna Apple y hacer el deploy.
5. **Daniel debe validar** su bio, "Juntos", el Mito y la franja (hoy son texto redactado por Claude a partir de lo dicho por Vic). Además, su nombre ya figura públicamente en el banner y en Spotify como creador.
6. **Dominio:** Vercel → Settings → Domains agregar `detrasdelcartel.com` (y `www`); Hostinger → reemplazar los registros del estacionado por los que Vercel indique. Después actualizar la dirección del banner y las bios.
7. **Logo simple** (Stitch: cartel + micrófono, sin texto, transparente) para menú, favicon y marca de agua de YouTube (150×150). Hoy el menú usa `MiniMark.jsx` (dibujo provisorio de Claude). **Foto de perfil** 800×800 y **bio de Instagram** (opciones armadas, 150 caracteres).
8. **Vista previa al compartir el link** (Open Graph: título, descripción e imagen del emblema).
9. **Rotular la duración** ("Duración 0:11") para que no se confunda con una hora (Vic la leyó como hora el 21-09).
10. **Al lanzar en serio:** quitar `noindex` (3 capas: meta en `index.html`, `public/robots.txt`, header `X-Robots-Tag` en `vercel.json`), hacer pública la cuenta de Instagram, repetir `/security-review`, revisar promesas públicas.
11. **Backup:** decisión de Vic (¿entra al script diario de `_scripts/backup_inmovalue.sh` o va aparte?). Hoy: la Mac (Time Machine) + el repo privado de GitHub (al día tras el deploy del 22-09).
12. Opcionales: botón QR en la barra de dispositivos (implica abrir el servidor dev a la red local); Google Forms en lugar del `mailto:` para "Proponé un tema"; ¿Spotify for Creators envía video HLS a Apple? (verificar); subir Vite (cambio mayor; solo afecta al servidor de desarrollo).

## 📜 HISTORIAL RESUMIDO
- **18-09:** la app llega generada por otra herramienta (prototipo React). Auditoría de seguridad; git, docs, cuentas separadas; SSH dedicada; panel 8002.
- **19-09:** publicada en modo "en construcción" (logo + barra roja) con `noindex` y headers de seguridad; modo día/noche.
- **20-09:** fotos y bios reales de los conductores; recuadro "Juntos"; "lado B"; menú y hero nuevos; logos (emblema cobrizo), banner de YouTube y portadas; estructura definitiva de la landing.
- **21-09:** landing completa publicada; conexión con YouTube (feed roto → API oficial con clave en Vercel); 3 `/security-review` sin hallazgos; Spotify y Apple creados sin publicar episodios; documentación al máximo detalle.
- **22-09 (01:14):** deploy de crema + fix de la API + enlace de Spotify (`e8aacba`), verificado en vivo; 4.ª `/security-review` sin hallazgos.

## 🚦 CÓMO RETOMAR EN OTRA SESIÓN
1. Leer este HANDOVER, `PLATAFORMAS.md` y `RUNBOOK.md`. Abrir el chat en `PROYECTOS_APPS/detras-del-cartel`.
2. `git status -sb` y `git log --oneline origin/main..HEAD` (debería estar todo subido; si aparecen commits, son cambios sin publicar).
3. Verificar en vivo: `curl -s https://detras-del-cartel.vercel.app/api/episodios`.
4. Mostrar cualquier cambio primero en `localhost:5173`; publicar solo con OK de Vic y `/security-review`.

## Dónde manejar cada cosa
| Tema | Dónde |
|---|---|
| Esta web (código, textos, deploy, YouTube, Spotify, Apple) | Chat abierto en `detras-del-cartel` |
| Panel de apps (8002) y neurona | `inmovalue-brain-app` |
| Ecosistema Inmovalue (CRM, webpage, etc.) | Sus propios chats. Esta app no interviene. |
