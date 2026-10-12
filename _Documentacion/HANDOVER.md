## 🔧 11-10-2026 (tarde) — LOS 6 MAJORES QUE FALTABAN DEL ECOSISTEMA

Se cerró la actualización de versiones: `typescript`, `eslint`, `better-sqlite3`,
`framer-motion`, `lucide-react` y `puppeteer`. Después de esto
`bash _scripts/versiones.sh revisar` dice **«TODAS LAS APPS COINCIDEN CON EL MANIFIESTO»**.

🔴 **TypeScript queda en la 6.0.3 y NO en la 7, que es la última. No es atraso.**
`typescript-eslint` —la pieza que le permite a eslint entender TypeScript, y que trae
`eslint-config-next`— declara `"typescript": ">=4.8.4 <6.1.0"`: **no acepta la 7**. El
motivo de fondo es que la 7 es el compilador reescrito en Go y salió **sin API de
programación** (llega en la 7.1). Comprobado que Next 16 sí compila con la 7 (probado en
dueno-vende-app: 679 ms de chequeo de tipos) — **el freno es el lint, no Next**. Se
destraba cuando typescript-eslint suba su tope. Anotado en `_scripts/versiones.json`.

🔴 **CADA TIPO DE PAQUETE TIENE SU PROPIA PRUEBA. `npm run build` sólo sirve para los
invisibles.** Un build en verde no dice nada de si una base abre, de si un PDF sale bien
o de cómo se ve una animación. Lo que se usó en cada caso está abajo.

### Qué cambió en esta app

`typescript` → 6.0.3. **Nada más.** `lucide-react` ya estaba en 1.55.0 desde la migración de
la mañana, y no usa `eslint` declarado, ni `better-sqlite3`, ni `framer-motion`, ni
`puppeteer`.

### Un detalle que quedó anotado de esta app

Declara `eslint-config-next` **pero no `eslint`**, y no tiene ni script `lint` ni archivo de
configuración. O sea: **esa dependencia no la usa nadie**, sólo arrastra un árbol de
paquetes (eslint 9, typescript-eslint y compañía) en cada instalación. Sacarla es una
limpieza pendiente, no urgente. (A `inmovalue-brain-app` le pasa lo mismo.)

### Sigue siendo la única excepción declarada del ecosistema

**Tailwind 3.4.19.** Se probó la 4 el 11-10 por la mañana y **se revirtió**: compilaba
perfecto pero **movía el diseño** (la home crecía 31 px y cambiaba el 6,9% de los píxeles en
la versión celular). La capa de compatibilidad oficial no alcanzó. Encontrar y compensar
cada default nuevo es una tarea propia, no un apéndice de una actualización.

### Probado

`npm run build` completo · `/` y `/privacidad` en 200 · y **detrasdelcartel.com responde
200 en vivo**.

### Publicado

**Sin cambios pendientes**: el commit local y el publicado son el mismo (`4530b8f`). El
sitio sigue **cerrado a los buscadores** a propósito — para abrirlo, la lista está en
`_Documentacion/LANZAMIENTO.md`.

---

## 🔴 EL SITIO ESTÁ CERRADO A GOOGLE, A PROPÓSITO

Está en internet y funciona —`https://detrasdelcartel.com`—, pero **no aparece en las
búsquedas**. Es una decisión, no un olvido: si Google entrara hoy, indexaría una página que dice
«Muy pronto: el primer episodio», y eso queda guardado semanas aunque después se cambie.

👉 **El día que se lanza, la lista completa de qué tocar está en [`LANZAMIENTO.md`](LANZAMIENTO.md).**
Son tres cosas que se abren y cuatro que **no se tocan nunca** (las que mantienen el buzón fuera
de Google, donde hay consultas de personas con nombre, mail y teléfono).

---

## 🔴 11-10-2026 — MIGRADA DE VITE A NEXT 16. VERIFICADA, **SIN PUBLICAR**

| | Antes | Ahora |
|---|---|---|
| Motor | Vite 5.4.21 | **Next 16.4.0** (App Router) |
| React | 18.3.1 | **19.3.0** |
| lucide-react | 0.344.0 | **1.55.0** |
| tailwindcss | 3.4.19 | 3.4.19 — **a propósito** (ver abajo) |
| Vulnerabilidades críticas | 0 | 0 |

### Qué se ganó, medido

El HTML que recibe un buscador —o una IA que cita páginas— pasó de una página **vacía** que se
rellenaba después en el navegador, a **30.843 bytes con 2.708 caracteres de texto real**. Era el
único motivo de la migración y es verificable: `curl` a la portada y leerla.

### Por qué AHORA, y por qué mi recomendación anterior estaba mal

Hasta esta misma mañana este archivo decía **«Recomendación: NO migrarla a Next»**. El argumento
era que la app no usaba nada de lo que Next aporta, y lo sostenía citando su propia
`ARQUITECTURA_APP.md`: *«sin base de datos, sin login, sin formularios»*.

🔴 **Esa frase estaba vieja y yo la repetí sin verificarla.** Desde el 27-09 la app tiene base de
datos propia (Supabase), login con Google y un formulario que recibe consultas de personas. Lo
marcó Vic. Es exactamente el caso que el propio texto daba como condición para migrar — ya se
había cumplido y nadie lo había actualizado.

**La lección no es «me equivoqué en esta app»:** es que la documentación describe el día en que
se escribió, y una recomendación que se apoya en ella sin mirar el código hereda su fecha. La
regla del ecosistema (relevar desde el código, no desde la doc) existe por esto, y acá la violé
citando un documento que yo mismo tenía a mano para comprobar.

El segundo argumento, el del momento, lo puso Vic: *«la aplicación no está en uso en este
momento, pero sí lo va a estar, entonces yo creería que el momento es ahora y antes de que
quizás crezca más»*. Es correcto: migrar cuesta menos cuanto menos hay.

### Tailwind se queda en 3, y no es por olvido

Pasar a 4 se probó y **se volvió atrás**. Compilaba perfecto, pero la comparación píxel a píxel
mostró el encabezado 31 px más alto (6,9 % de los píxeles distintos), y el parche oficial de
compatibilidad de bordes no alcanzó porque esta app define los colores de borde a mano. Es una
tarea aparte, de unas 2 h, con su propia verificación.

### 🔴 CUATRO COSAS QUE COMPILABAN PERFECTO Y NO FUNCIONABAN

Ninguna dio un error. Van anotadas porque son la clase de falla que vuelve:

1. **La CSP dejaba la página muerta.** Next escribe 3 programas DENTRO del HTML. Con la regla que
   tenía la app (`script-src 'self'`) el navegador los bloquea: **las capturas salían idénticas
   y la página no respondía a nada.** La salida fácil era permitir programas sin firma
   (`'unsafe-inline'`), que es el agujero más explotado que existe. En vez de eso, `proxy.js`
   los firma con un número al azar por visita. Eso obliga a armar la página en cada pedido: de
   ahí el `force-dynamic` de `app/layout.jsx`. **No borrar ninguna de las dos piezas sin leer la
   otra.**
2. **El endpoint del botón de publicar no existía.** Se llamaba `__publicar`, y **Next ignora por
   completo las carpetas que empiezan con guión bajo.** Compilaba sin una queja y devolvía 404.
   Ahora es `publicar-local`.
3. **El atajo de Vic (`start.command`) fallaba al arrancar:** le pasaba a Next banderas de Vite
   (`--strictPort`, que en Next no existe). El puerto ahora va en el `dev` de `package.json`,
   en un solo lugar.
4. **Tailwind buscaba las clases en `./index.html`**, que ya no existe. Una clase usada sólo en
   `app/` no habría generado estilo, sin ningún error.
5. **La portada daba error 500 en desarrollo, y compilada andaba bien.** El simulador de
   dispositivos leía el ancho de la ventana en el primer dibujado; con Vite la página se armaba
   **siempre** en el navegador, con Next se arma primero en el servidor, donde no hay ventana.
   🔴 **Esta no se veía al compilar:** en producción esa barra está apagada y nunca se dibuja, así
   que el compilado y las 6 capturas salían perfectos. Fallaba sólo en desarrollo, que es
   justamente el modo en el que Vic abre la app. **De acá en más se verifican los dos modos.**

### 🔴 Y lo que habría roto la PUBLICACIÓN

El panel de Vercel tiene este proyecto como **framework Vite, salida `dist`**. Next no produce
`dist`: Vercel habría compilado bien y después no habría encontrado qué publicar — sin un error
de código en el registro. Lo arregla `vercel.json` desde el repositorio (`framework: nextjs` +
`outputDirectory: null`), que manda sobre el panel. El detalle: `../LEEME_vercel.json.md`.

### Una de seguridad que la migración traía de regalo

Vite escuchaba sólo en localhost por su cuenta. **Next, si no se le dice, escucha en todas las
interfaces:** la app habría quedado visible para cualquiera en la red donde esté la Mac, y
encima choca con el `tailscale serve` que ya tiene tomado el 5173. Los dos comandos llevan
`-H 127.0.0.1`.

### Cómo se verificó (no es «parece andar»)

- **6 capturas** —portada, buzón y privacidad, en escritorio y celular— contra lo que está
  publicado hoy: **0 píxeles de diferencia** en las seis.
- **Las 33 pruebas** del feed de YouTube.
- `/api/episodios` devuelve **lo mismo que producción**.
- El **formulario**: guardó una fila real en Supabase y se borró. Los 4 frenos anti-robot siguen
  puestos (campo trampa, menos de 3 segundos, mail con copia oculta, privada sin contacto).
- La fila anónima quedó **sin nombre, sin mail, sin teléfono, sin zona y sin origen**.
- El **login con Google** llega hasta la pantalla de Google con el `client_id` correcto. Apretar
  el botón y entrar es lo único que queda para Vic.
- **La prueba que importaba:** que la página despierte. Un botón de verdad despliega el
  formulario (0 → 11 campos), sin bloqueos de CSP ni errores de JavaScript.
- Los **candados del botón de publicar**, uno por uno: 404 en producción, 403 sin token, 403 con
  token y origen ajeno, 403 con token inventado, y se niega a publicar sin la constancia del
  `/security-review` **sin tocar el repositorio**.

### 🟡 LO QUE FALTA, Y ES DECISIÓN DE VIC

🔴 **Publicar.** Producción está en `f0e3f25` (28-09) y hay **11 commits locales sin subir**,
incluida la subida de Vite 5→8 / React 18→19 y toda la migración. El botón pide antes la
constancia del `/security-review`, que hay que correr sobre estos cambios.

Dos cosas más, chicas:

- **`favicon.ico` da 404** — ya daba 404 en producción, no lo trae la migración. Hay un
  `public/logo.png` que podría servir de icono; cambia lo que se ve en la pestaña, así que se
  consulta antes.
- 🔴 **Las variables en Vercel tienen los nombres de Vite, y eso ROMPIÓ el buzón en producción.**
  Cada herramienta usa su propio prefijo para marcar qué variables pueden viajar al navegador:
  Vite usaba `VITE_`, Next usa `NEXT_PUBLIC_`. Al compilar en Vercel,
  `NEXT_PUBLIC_SUPABASE_URL` no existía y `/consultas` mostraba **«Falta configurar Supabase»**
  en lugar del botón de Google. **En la Mac funcionaba** —el archivo de claves local tiene los
  dos nombres—, así que la falla **sólo existía en internet** y apareció recién al publicar.
  `lib/consultas.js` ya aceptaba los dos nombres, pero eso cubre al servidor: el navegador
  recibe lo que se le grabó al compilar y sólo se graban las `NEXT_PUBLIC_`. **Resuelto** con un
  puente en `next.config.mjs` (bloque `SUPABASE_PARA_EL_NAVEGADOR`), probado compilando con
  **sólo** los nombres viejos presentes: la URL y la clave pública quedan grabadas y la clave
  secreta aparece 0 veces en el compilado.
  📌 **Limpieza pendiente:** renombrar las dos variables en el panel de Vercel y borrar ese
  bloque. Requiere la cuenta del podcast; la herramienta de Vercel de esta Mac está con la
  cuenta de Inmovalue y no llega a ese equipo.
- 🔴 **La lección, que vale más que el caso:** lo que se graba al compilar sólo se puede
  comprobar **compilando en las condiciones del lugar donde se publica**. Acá el archivo de
  claves local tenía los dos nombres y tapaba la falla. La prueba buena fue dejar únicamente
  los nombres que hay en Vercel y volver a compilar.

---

# HANDOVER — Detrás del Cartel

> Última actualización: **2026-09-27 (noche)**. Se sumó el **módulo de consultas** (formulario que guarda en base + buzón privado `/consultas`): ver `MODULO_CONSULTAS.md`. Frecuencia: cerrado sin acción (pendiente 2). La bitácora anterior está en el historial de git.
> App **INDEPENDIENTE** del ecosistema Inmovalue: no comparte repo, base, cuentas ni credenciales. Solo cumple las mismas reglas de seguridad.
> Documentos hermanos: `MODULO_CONSULTAS.md` (formulario + buzón + su seguridad) · `PLATAFORMAS.md` (cada cuenta, IDs y trampas) · `ARQUITECTURA_APP.md` · `SEGURIDAD.md` · `RUNBOOK.md` (operación y día de lanzamiento) · `../src/assets/logos/LEEME.md` (inventario de logos).

## 🚨 ZONA PROHIBIDA
- **Directorio prohibido de iCloud (carpeta "C"):** ningún proceso lo toca (regla global de Vic).
- **NO usar las cuentas del ecosistema** (GitHub/Vercel/Supabase de Inmovalue) ni las personales de Vic para esta app. Cuentas propias del podcast (ver `PLATAFORMAS.md`).
- **NO conectar esta app a ninguna base de datos de otros proyectos.** Si necesita base, una propia.
- Nunca subir `.env`, claves, tokens ni datos de personas al repo. **La clave de YouTube vive SOLO en Vercel.**
- 🔴 **La clave SECRETA de Supabase (`SUPABASE_SECRET_KEY`) saltea todos los permisos de la base.** Solo en Vercel y en `.env.local` (que está en `.gitignore`). Nunca al navegador, nunca al repo, nunca a un chat. La `publishable` sí puede andar suelta.
- 🔴 **`/consultas` y la base tienen datos de personas** (nombre, mail, teléfono, y casos: herencias, divorcios). Antes de tocar cualquier cosa de ese módulo, leer `MODULO_CONSULTAS.md`.
- **`/security-review` antes de CADA deploy** (regla fija de Vic). Hecho 5 veces (la última el 22-09, antes del deploy del pie `dd4fe38`, sin hallazgos).
- **No modificar código ni publicar sin OK de Vic.** Proponer primero, mostrar en `localhost:5173`, recién ahí publicar. Lección del 20-09: cuando Vic pidió cambiar un TEXTO, se rediseñó el bloque por iniciativa propia y hubo que deshacerlo.
- **NUNCA transcribir IDs o enlaces desde una captura de pantalla** (Lección del 21-09: al copiar a mano el ID de Spotify confundí una "l" minúscula con una "I" mayúscula; el botón de la web habría quedado roto incluso con el programa publicado). Pedir siempre que Vic **copie y pegue el texto**, y comparar carácter por carácter.

## ESTADO ACTUAL — histórico (21-09-2026, noche)

> ⚠️ Lo de acá abajo describe el estado de SEPTIEMBRE y se conserva como historia. El estado
> vigente es el bloque del 11-10-2026, al principio de este archivo. En particular: **ya no es
> cierto que producción sea igual al código local.**

### Producción = local (era cierto el 22-09; **dejó de serlo**: ver el bloque del 11-10)
Producción (`https://detras-del-cartel.vercel.app`) está al día con `main`; último cambio de código: **`dd4fe38`** (pie corregido). Antes, el deploy 1 fue `e8aacba`. Se subieron: fondo **crema** de la tarjeta de portada en modo día · corrección **404 → lista vacía** en la API · enlace de **Spotify** activo · documentación. **Verificado en vivo:** página HTTP 200 · `/api/episodios` → **HTTP 200 `{"ok":true,"episodios":[]}`** (antes daba 502: **el fix quedó confirmado**) · CSP/HSTS/`noindex` presentes · 0 violaciones de CSP y 0 recursos rotos en modo día y noche · sin desborde a 1280 px · el JS publicado contiene el enlace de Spotify correcto y 0 ejemplos/0 claves · el CSS publicado tiene la regla del crema. Tarjeta de Spotify **activa** (lleva a "no encontrado" hasta publicar el 1.er episodio); tarjeta de Apple "Próximamente".

### 🆕 MÓDULO DE CONSULTAS (27-09-2026) — PUBLICADO Y FUNCIONANDO
El `mailto:` de "Proponé un tema" se reemplazó por un **formulario que guarda en una base
propia del podcast** (Supabase `detras-del-cartel`, proyecto `wdvvsrikmyorfiimqrkk`), y se
sumó **`/consultas`**: el buzón privado con login de Google, seguimiento por situación y
próximo paso, bitácora por consulta, etiquetas de tema, papelera y exportación a Excel.
Detalle completo, decisiones y pruebas de seguridad en **`MODULO_CONSULTAS.md`**.
**Publicado y verificado en vivo el 27-09:** el formulario guarda de verdad, `/consultas` entra
con la cuenta del proyecto y una cuenta ajena ve "esta cuenta no tiene acceso". Base limpia
(se borraron las consultas de prueba), registros nuevos apagados en Supabase y política de
privacidad en `/privacidad`. **Los dos entran con la MISMA cuenta** (la del proyecto): no se
suma a Daniel aparte, con el costo de que la bitácora no distingue quién anotó qué.

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
| **Escribinos**: formulario con 3 caminos (programa / privada / anónima) que guarda en base | ✅ 27-09, sin publicar (ver `MODULO_CONSULTAS.md`) |
| **`/consultas`**: buzón privado con login de Google, bitácora, filtros, papelera y Excel | ✅ 27-09, publicado |
| **`/privacidad`**: política de privacidad, enlazada desde el pie y desde el formulario | ✅ 27-09 |
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
- **Un dato de afuera que termina dentro de una dirección hay que CODIFICARLO, aunque "ya esté validado".** El 27-09 la validación del mail dejaba pasar `victima@mail.com?bcc=otro%40evil.com`: al responder desde el buzón, el correo salía con copia oculta a un tercero. Lo encontró `/security-review`, no las pruebas. Vale para `mailto:`, `https://` y `tel:`.
- **En Supabase, "Allow new users to sign up" hay que dejarlo PRENDIDO hasta el primer ingreso de cada uno**: el usuario se crea recién al entrar la primera vez. Si se apaga antes, te rechaza a vos mismo.
- **Esconder una dirección no es seguridad.** `/consultas` puede ser adivinable: lo que protege es que la base no le entrega filas a quien no está en `autorizados`. El `noindex` es higiene, no candado.
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
2. ~~**Decidir la frecuencia**~~ **SIN ACCIÓN (Vic, 27-09-2026).** La frecuencia prevista es **quincenal** (12 episodios en 6 meses, 20-25 min) y **no hay nada que corregir**: la única frase publicada es "Nuevos **episodios** todos los meses" —en el banner del canal y en la última línea de la descripción de YouTube—, que **está en plural y significa "todos los meses hay episodios nuevos"**, no "uno por mes". Es compatible con quincenal. Decisión: **dejarla así**, sin decir "cada 15 días" (el banner es una imagen: comprometer un ritmo por escrito antes de arrancar ata sin necesidad). La web NO menciona frecuencia en ningún lado (verificado). La contradicción "todos los meses"/"cada semana" existe solo en `src/assets/banners/banner-youtube-v2.jpg`, que **no está publicado**; el subido al canal (2560×1440) tiene solo la línea plural.
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
- **22-09 (~01:25):** pie de página corregido a pedido de Vic: "Daniel Bryn" y "Víctor Miascovsky" no se cortan entre renglones (`whitespace-nowrap`) y el mail queda en UNA línea (columnas apiladas en celular, `flex flex-col sm:flex-row`); medido en 8 anchos (320-1440 px): mail en una línea, sin desborde. 5.ª `/security-review` sin hallazgos.

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


---

## 🌐 Acceso remoto desde la MacBook Air y el celular (2026-10-06)

Esta app se abre desde el **menú del ecosistema** (brain-app, puerto 8002), que es el
punto de entrada único al ecosistema desde afuera:

    http://macbook-pro-de-victor.tail460b3a.ts.net:8002     → botón "▶ Abrir" de esta app
    (también responde el nombre corto: http://macbook-pro-de-victor:8002)

El menú la levanta si está apagada, espera a que el puerto conteste y redirige solo. La
app queda en el puerto **5173**, con el mismo host por el que se entró al menú.

### 🔴 Su `start.command` cambió: ya no abre el navegador cuando lo lanza el menú

El script terminaba con `open http://localhost:<puerto>`, y ese `open` corre **en la Mac
que ejecuta la app**. Al abrirla desde la MacBook Air, la pestaña se abría en la Air (bien)
y además una de más en el Mac Pro, que no servía a nadie y se acumulaba.

Ahora ese `open` está dentro de `if [ -z "$BRAIN_LAUNCH" ]`:

| Cómo se lanza | ¿Abre navegador en esta Mac? |
|---|---|
| Desde el menú del 8002 (pasa `BRAIN_LAUNCH=1`) | **No** — la pestaña se abre donde se apretó |
| Doble clic desde Finder | **Sí**, igual que siempre |

**No borrar ni "simplificar" esa condición.** Si se saca, vuelven las pestañas sueltas.

### Cómo la levanta el menú

- Ejecuta este `start.command` con `zsh -lc`, **no con `open`**: así no se abre ninguna
  ventana de Terminal. Lo que antes se veía en esa ventana va a
  `inmovalue-brain-app/.logs/<app>.log`.
- **Si la app ya responde en su puerto, el menú NO ejecuta el script.** Importa porque
  este `start.command` hace `kill -9` del proceso del puerto y lo relanza: sin ese
  chequeo, apretar "Abrir" sobre una app que estaba funcionando la tiraba abajo.
- Le pasa un **entorno limpio** (HOME, USER, LOGNAME, PATH, SHELL, LANG, TMPDIR,
  NODE_ENV, BRAIN_LAUNCH), no el del menú. Heredar el entorno del menú rompía la
  configuración de las apps: Next no sobrescribe una variable que ya viene del entorno.
- El puerto sale de `inmovalue-brain-app/neuronas/apps/<app>.md` (campo `puerto:`) y la
  app tiene que estar en el `COMMAND_MAP` de `api/launch/route.ts`. Sin lo primero no hay
  link; sin lo segundo, "Abrir" responde *App desconocida*.

### Esta app escucha solo en 127.0.0.1 → va por Tailscale Serve

No está abierta a la red: se publica dentro del tailnet con

    tailscale serve --bg --http=5173 http://127.0.0.1:5173

Ya está configurado y persiste entre reinicios. **Serve responde al NOMBRE del tailnet,
no a la IP `100.x`**: por IP devuelve `404 page not found` (lo contesta Tailscale, no la
app, y parece un error de la app). El menú traduce la IP al nombre solo, así que
entrando por el menú da igual.

### Se puede bajar desde el menú

El botón **⏹** de su tarjeta la detiene: busca quién escucha su puerto con
`lsof -ti:<puerto>` y le manda SIGTERM. Pide confirmación. Hace falta porque sin
ventana de Terminal no hay otra forma de pararla.

### 🔴 Vite BLOQUEA los hosts que no conoce (Next solo avisa)

Entrar por Tailscale devolvía `Blocked request. This host (...) is not allowed` en lugar
del sitio: es la defensa de Vite contra DNS rebinding. **Esta era la única app del
ecosistema que fallaba al abrirse desde el menú.** Resuelto con `server.allowedHosts`
en `vite.config.js` — solo afecta al servidor de desarrollo, **no al build ni a Vercel**.

Si cambia el nombre del tailnet, actualizar esa lista. Toda app nueva con Vite necesita
lo mismo.

### Qué NO cambió

- La app, su código y sus datos: intactos.
- El doble clic del `start.command` desde Finder: igual que siempre.
- **Las pestañas son independientes, los datos no.** Lo que se hace desde la Air queda
  guardado en el Mac que corre la app y se ve desde el Pro al recargar; lo único que no
  se comparte es la ventana del navegador.

Detalle completo y las trampas de la sesión: `inmovalue-brain-app/_Info Proyecto/HANDOVER.md`.
