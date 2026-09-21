# HANDOVER — Detrás del Cartel

> Última actualización: **2026-09-21 (noche)**. Reescrito completo con el estado real. La versión anterior (bitácora acumulada) está en el historial de git.
> App **INDEPENDIENTE** del ecosistema Inmovalue: no comparte repo, base, cuenta de hosting ni credenciales. Solo cumple las mismas reglas de seguridad.

## 🚨 ZONA PROHIBIDA
- **Directorio prohibido de iCloud (carpeta "C"):** ningún proceso lo toca (regla global de Vic).
- **NO usar las cuentas del ecosistema** (GitHub/Vercel/Supabase de Inmovalue) para esta app. Cuentas propias (ver "Cuentas").
- **NO conectar esta app a ninguna base de datos de otros proyectos.** Si algún día necesita base, una propia.
- Nunca subir `.env`, claves, tokens ni datos de personas al repo. La clave de YouTube vive SOLO en Vercel.
- **`/security-review` antes de CADA deploy** (regla fija de Vic). Hecho 3 veces (ver `SEGURIDAD.md`).
- **No modificar código sin OK de Vic.** Proponer primero, mostrar en localhost, recién ahí publicar. Lección del 20-09: cuando Vic pidió cambiar un TEXTO, se rediseñó el bloque por iniciativa propia y hubo que deshacerlo.

## 🔴 ESTADO ACTUAL (21-09-2026)
**Publicada y funcionando en `https://detras-del-cartel.vercel.app`** (Vercel, equipo `detrasdelcartel`, plan Hobby). Es la landing COMPLETA, con `noindex` (Google no la muestra). Cada `git push` a `main` redespliega solo (~30 s).

| Bloque de la web | Estado |
|---|---|
| Menú (mini logo, nombre, botón "Escuchar" → baja al episodio, botón día/noche) | ✅ |
| Portada: emblema cobrizo + "EL LADO B DEL MERCADO INMOBILIARIO" + texto | ✅ |
| Dónde escucharnos: YouTube e Instagram activos; Spotify y Apple "Próximamente" | ✅ |
| **Último episodio (automático desde YouTube)** | ✅ **Probado en vivo el 21-09**: con el video de prueba público aparecía solo; al pasarlo a Privado desapareció y volvió "Muy pronto" (tras renovarse la caché, ~5 min) |
| Mito o realidad (texto fijo) | ✅ (texto redactado por Claude; lo valida Vic) |
| Los Conductores: fotos reales, bios, franja, recuadro "Juntos" | ✅ (falta que Daniel valide su bio y "Juntos") |
| Episodios anteriores (automático, aparece desde el 2.º video) | ✅ implementado; sin datos reales todavía |
| Proponé un tema (botón `mailto:` al Gmail del proyecto) | ✅ |
| Pie (Gmail, canales, aviso "informativo, no reemplaza asesoramiento") | ✅ |
| Barra inferior del celular (Episodios / Escuchar / Nosotros / Temas) | ✅ |

**Hoy el bloque de episodio muestra "Muy pronto: el primer episodio"** porque el video de prueba (`lfogKQdhBMc`, "muy pronto 10s") está en **Privado**. Cuando Vic suba el primer episodio real (público, horizontal), aparece solo.

**Localhost (`localhost:5173`, botón "▶ Abrir" del panel 8002):** mismo código + barra flotante de dispositivos (solo dev) + `?demo=1` (episodios de ejemplo) + `?produccion=1` (vista "en construcción").

## 🔑 CUENTAS Y ACCESOS (sin secretos)
- **GitHub:** cuenta `detrasdelcartelpodcast-rgb`, repo privado `detras-del-cartel`, rama `main`. Acceso por **clave SSH dedicada** (`~/.ssh/id_ed25519_cartel`, alias `github-cartel` en `~/.ssh/config`). Repo con `credential.helper` vacío y identidad local (email noreply) para NO heredar las credenciales del ecosistema.
- **Vercel:** equipo `detrasdelcartel` (cuenta nueva, 2FA a confirmar por Vic), conectado al repo.
- **Google Cloud:** proyecto `detras-del-cartel` (cuenta Gmail del podcast). Clave de API "YouTube Data API v3" → cargada en Vercel como **`YOUTUBE_API_KEY`** (Production). **Verificar que la clave esté restringida a "YouTube Data API v3"** (Vic lo iba a hacer al crearla; no quedó confirmado por escrito).
- **YouTube:** canal `@detrasdelcartelpodcast`, ID `UCRVH9mlcrwMockg7aTbOr-Q` (público). Teléfono verificado (a confirmar). Banner y descripción cargados.
- **Instagram:** `@detrasdelcartelpodcast`, hoy **privada** (decisión de Vic hasta lanzar).
- **Gmail del proyecto:** `detrasdelcartelpodcast@gmail.com` (contacto de la web y destino de "Proponé un tema").
- **Dominio `detrasdelcartel.com`:** es de Vic, en **Hostinger**, hoy "estacionado". Sin registros de correo (MX). **Todavía NO apunta a Vercel.**
- **Panel del 8002** (`inmovalue-brain-app`): tiene la neurona `apps/detras-del-cartel` y el botón "▶ Abrir" (usa `start.command`).

## 🎯 OBJETIVO Y CRITERIOS (decisiones de Vic)
- **Landing de un PODCAST con el MÍNIMO mantenimiento posible.** Todo lo que cambia solo (episodios, contador, fechas) se lee de YouTube; lo escrito a mano es lo mínimo (textos fijos + el "Mito").
- **Esta web INFORMA, no ofrece servicios.** Los servicios de Vic y Daniel viven en sus propias webs. Nada de "te acompaño / te ayudo / auditoría gratuita". Evitar "tasar/tasación", "avisos" (decir "oferta"), "gratis" (decir "sin costo"), acusaciones o alusiones a colegas ("hay de todo" va implícito).
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
`Vercel /api/episodios` → YouTube Data API v3 (con `YOUTUBE_API_KEY`) → caché 5 min → `Episodios.jsx`. Muestra videos **públicos e insertables** del canal (máx. 12). El título "#5 · Algo" muestra "Nº 5". **Resumen = las 2 primeras líneas de la descripción del video** → al subir un episodio, escribir ARRIBA 2 líneas propias del episodio y DEBAJO el texto fijo del canal (que ya se pre-carga como descripción predeterminada). Si la API falla o no hay clave, cae al feed público (`videos.xml`), que YouTube rompió el 1-3 sep 2026 (404 constante; era intermitente desde dic 2025). Si todo falla → "Muy pronto" (nunca se rompe). Detalle técnico: `ARQUITECTURA_APP.md`; operación: `RUNBOOK.md`.

## 🔴 TRAMPAS Y LECCIONES
- **Código que entrega Stitch/Gemini "en React/SVG" NO es fiel al diseño** (es una recreación imprecisa). La fuente de verdad es la IMAGEN. En Stitch: Exportar → `.zip` → `screen.png` (1024 px, sin transparencia; siempre se llama igual: renombrar).
- **Las imágenes pegadas en el chat NO quedan en disco.** Pedir siempre el archivo (carpeta Descargas + ruta).
- **Fotos de conductores y logos no publicados:** viven en `src/assets/` y un plugin de `vite.config.js` descarta del build las imágenes que ningún código publicado usa. Verificado en ambos sentidos.
- **Datos de ejemplo del prototipo** (episodios demo) van envueltos en `import.meta.env.DEV`: no viajan al JS de producción (verificado: 0 apariciones de textos de ejemplo).
- **Colores:** en secciones nuevas usar SIEMPRE los colores del tema (`bg-card`, `text-fg`, `text-muted`, `border-line/10`, `text-accent`…), nunca `text-white` ni hex fijos, o esa sección no responderá al modo claro.
- **Caché:** los cambios en YouTube tardan hasta ~5 min en verse en la web (con hasta 1 h de dato viejo si YouTube falla).
- **Un video "no listado" NO aparece en la web** (a propósito); tampoco uno privado.
- **"0:11" en la fecha del episodio es la DURACIÓN**, no la hora (Vic lo leyó como hora el 21-09). Propuesta pendiente: rotularlo "Duración 0:11".
- **Puerto 5173** (default de Vite): si otro proyecto Vite lo ocupa, `start.command` falla por `--strictPort`.
- **Vercel Hobby es solo para uso no comercial**: si la web pasa a promocionar servicios o llevar publicidad, requiere Pro.

## 🟡 PENDIENTES (por prioridad)
1. **Confirmar la restricción de la clave** en Google Cloud (solo "YouTube Data API v3") y el 2FA de la cuenta de Vercel.
2. **Subir el primer episodio real** (público, 16:9, título "#1 · …", 2 líneas de resumen arriba) y verificar en la web. Antes: probar "Ver en YouTube" y el reproductor en el celular real.
3. **Daniel debe validar** su bio, el recuadro "Juntos", el texto del Mito y la franja.
4. **Decidir el fondo de la tarjeta de portada en modo día:** hoy gris (se ve apagado). Vic dudó; se comparó gris/blanco/crema/sin tarjeta (`~/Downloads/comparativa-fondo-portada.png`); recomendación de Claude: **crema**.
5. **Rotular la duración** ("Duración 0:11") y revisar si conviene mostrar la fecha en otro formato.
6. **Dominio:** en Vercel → Settings → Domains agregar `detrasdelcartel.com`; en Hostinger (zona DNS) reemplazar los registros del "estacionado" por los que Vercel indique (A y CNAME de `www`). Después mirar que el banner de YouTube ya no apunte a un dominio vacío.
7. **Spotify y Apple Podcasts:** necesitan un servicio de alojamiento con feed RSS (p. ej. Spotify for Creators, gratis) → enviar a Apple Podcasts Connect → pegar los enlaces en `siteConfig.channels[].url` (la tarjeta se activa sola). Portadas listas: `~/Downloads/portada-podcast-azul-3000x3000.jpg` y `…-blanca-…` (agrandadas, no redibujadas).
8. **Stitch:** pedir versión SIMPLE del logo (cartel + micrófono, sin texto, transparente) para menú, favicon y marca de agua de YouTube (150×150). Hoy el menú usa `MiniMark.jsx` (dibujo provisorio de Claude).
9. **Vista previa al compartir el link** (etiquetas Open Graph: título, descripción e imagen del emblema). Nota: con `noindex` no interfiere.
10. **Foto de perfil** de YouTube/Instagram (emblema recortado en círculo, 800×800) y bio de Instagram (opciones armadas, límite 150 caracteres) con "lado B".
11. **Al lanzar en serio:** quitar `noindex` (3 capas: meta en `index.html`, `public/robots.txt`, header `X-Robots-Tag` en `vercel.json`), hacer pública la cuenta de Instagram, repetir `/security-review`, revisar las promesas ("Nuevos episodios todos los meses" está en el banner y la descripción de YouTube: solo si se puede sostener).
12. **⚠ Frecuencia inconsistente:** la propuesta del podcast (memoria del 17-08: 12 episodios, **quincenal**, 6 meses, 20-25 min) no coincide con el banner de YouTube ("Nuevos episodios todos los meses" / en una versión "cada semana") ni con la descripción del canal ("todos los meses"). Decidir UNA frecuencia y alinear banner (regenerable con `tools/componer-banner-youtube.py`), descripción del canal y la del video. Además la propuesta original mencionaba un formulario que llega al mail; hoy es un `mailto:` (decisión del 21-09).
13. **Backup:** decisión de Vic (¿entra al script diario de `_scripts/backup_inmovalue.sh` o va aparte?). Hoy el código vive en la Mac (Time Machine) y en el GitHub propio.
14. Botón QR en la barra de dispositivos (implica abrir el servidor dev a la red local; decisión de Vic). Opcional: Google Forms en lugar del `mailto:` para "Proponé un tema".
15. `npm audit`: 0 vulnerabilidades en producción; 2 en desarrollo (esbuild/vite, solo servidor local). Subir Vite es un cambio mayor: evaluar con calma.

## 🚦 CÓMO RETOMAR EN OTRA SESIÓN
1. Leer este HANDOVER y `RUNBOOK.md`. Abrir el chat en `PROYECTOS_APPS/detras-del-cartel`.
2. `git log --oneline | head` y `git status` (todo debería estar subido).
3. Verificar en vivo: `curl -s https://detras-del-cartel.vercel.app/api/episodios` → `{"ok":true,"episodios":[…]}`.
4. Mostrar cualquier cambio primero en `localhost:5173`; publicar solo con OK de Vic y `/security-review`.

## Dónde manejar cada cosa
| Tema | Dónde |
|---|---|
| Esta web (código, textos, deploy, YouTube) | Chat abierto en `detras-del-cartel` |
| Panel de apps (8002) y neurona | `inmovalue-brain-app` |
| Ecosistema Inmovalue (CRM, webpage, etc.) | Sus propios chats. Esta app no interviene. |
