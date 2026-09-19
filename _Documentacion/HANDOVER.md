# HANDOVER — Detrás del Cartel

> Última actualización: 2026-09-19. App INDEPENDIENTE del ecosistema Inmovalue: no comparte repo, base, cuenta de hosting ni credenciales. Solo cumple las mismas reglas de seguridad.

## 🚨 ZONA PROHIBIDA
- **Directorio prohibido de iCloud (carpeta "C"):** ningún proceso lo toca (regla global de Vic).
- **NO usar las cuentas del ecosistema** (GitHub/Vercel/Supabase de Inmovalue) para esta app. Cuentas propias, ver `RUNBOOK.md`.
- **NO conectar esta app a ninguna base de datos de otros proyectos.** Si necesita base, una propia.
- Nunca subir `.env`, tokens ni datos de personas al repo.

## 🔴 ESTADO ACTUAL
- Landing estática de una página: React 18 + Vite 5 + Tailwind 3 + lucide-react. Sin backend ni base de datos.
- Generada con otra herramienta el 18-09-2026; auditada ese mismo día contra las reglas de seguridad (ver `SEGURIDAD.md`).
- Corre local en `127.0.0.1:5173` (`start.command` o botón "▶ Abrir" del panel del 8002).
- Git: rama `main`, historial de 1 commit limpio (se unificó antes del primer push para no subir referencias privadas). `.gitignore` creado. El repo tiene `credential.helper` vacío a propósito para no heredar las credenciales de Inmovalue.
- **GitHub (18-09):** cuenta propia `detrasdelcartelpodcast-rgb`, repo privado vacío `detras-del-cartel`. Autenticación por clave SSH dedicada (`~/.ssh/id_ed25519_cartel`, alias `github-cartel` en `~/.ssh/config`, sin passphrase). Remote `origin` configurado; identidad local con el email noreply de GitHub. Conexión verificada; huella del host coincide con la publicada por GitHub.
- **✅ PUBLICADA (19-09-2026)** en `https://detras-del-cartel.vercel.app` (equipo Vercel `detrasdelcartel`, plan Hobby, 2FA a configurar/confirmar por Vic). Cada `git push` a `main` redespliega solo. Verificado en vivo: HTTP 200, CSP/HSTS/nosniff/frame DENY/Referrer/Permissions-Policy/X-Robots-Tag presentes, `robots.txt` Disallow, sin errores de CSP, se ve logo + barra roja "SITIO EN CONSTRUCCIÓN". Es de acceso público por URL (con noindex: no aparece en buscadores).

- **Dos vistas (18-09, decisión de Vic):** en **localhost** se ve el PROTOTIPO completo (todos los bloques de `siteConfig.sections` en `true`, más la barra de dispositivos). En el **sitio publicado** se ve solo `src/Construccion.jsx`: logo grande centrado + barra roja fija arriba "SITIO EN CONSTRUCCIÓN". Se decide con `import.meta.env.DEV`; para previsualizar lo público en local: `localhost:5173/?produccion=1`. Verificado en el bundle de producción: el contenido de relleno (métricas, episodios, fotos Unsplash, formulario, mail inventado) NO viaja. Al lanzar en serio: cambiar la condición `construccion` en [App.jsx](../src/App.jsx) y activar bloque por bloque con contenido REAL.
- **`noindex` en 3 capas:** `<meta robots>` en `index.html`, `public/robots.txt` (Disallow: /) y header `X-Robots-Tag` en `vercel.json` (junto con CSP, HSTS, nosniff, frame DENY, Referrer y Permissions-Policy). Quitar solo cuando Vic decida salir al público.
- **Barra flotante de dispositivos** (`src/dev/DevSimulator.jsx`, solo localhost): celular / tablet / PC + rotar, arrastrable, como la de la webpage. Sin librerías nuevas. Verificado que el build de producción NO la incluye. Pendiente: botón QR para abrir en el celular (requiere escuchar en la red local; decisión de Vic).
- **Contacto y dominio (Vic, 18-09):** el mail de contacto será el Gmail del proyecto y el formulario, cuando exista, enviará a ese mismo Gmail. El dominio `detrasdelcartel.com` es de Vic (registrado en **Hostinger**, a confirmar); apuntarlo a Vercel por DNS queda para el momento del lanzamiento. Cloudflare/R2 delante: se evalúa después.

## 🔴 TRAMPAS Y DECISIONES
- **2026-09-18 — El formulario "Enviar Caso" es maqueta** ([src/App.jsx](../src/App.jsx), `handleSubmit`): muestra "enviado" sin enviar nada. No publicar así: el visitante creería que el caso llegó. Opciones: quitarlo/reemplazarlo por un mail, o conectarlo a un backend propio (validación, antispam, consentimiento, política de privacidad).
- **2026-09-18 — Puerto 5173** (default de Vite) porque el servidor ya estaba corriendo ahí. `--strictPort`: si está ocupado, falla en vez de moverse.
- **2026-09-18 — Incorporada al panel del 8002** con una neurona propia (`inmovalue-brain-app/neuronas/apps/detras-del-cartel.md`) y una línea en `api/launch/route.ts`. Brain separado en principio; combinar más adelante si Vic lo decide.
- **2026-09-18 — Backup:** decisión pendiente de Vic (¿entra al script diario o va aparte?). Hasta que decida, NO está en `_scripts/backup_inmovalue.sh`.
- **2026-09-18 — El código de `siteConfig`** ([src/App.jsx](../src/App.jsx), arriba) concentra textos, links, fotos e interruptores de sección. Se edita ahí, no en el JSX.

## 🟡 PENDIENTES (por prioridad)
1. Conectar el dominio `detrasdelcartel.com` (Hostinger, hoy estacionado) a Vercel por DNS: se hace al lanzar. Vercel > Settings > Domains + registros A/CNAME en Hostinger.
2. Formulario: fuera del sitio publicado (no viaja). Al activarlo: backend propio que envíe al Gmail del proyecto, con el mail solo en variable de entorno.
3. Fotos de Unsplash: no viajan al sitio publicado. Al activar conductores: fotos reales locales en `public/`.
4. Poner los links reales de los 4 canales (hoy genéricos: spotify.com, youtube.com, etc.).
5. Vulnerabilidades npm (esbuild/vite, solo servidor de desarrollo): evaluar subir Vite (cambio mayor).
6. ✅ Headers de seguridad en `vercel.json` (hecho 18-09; CSP a validar en el deploy real).
7. `/security-review` antes del primer deploy (paso fijo, no opcional).
8. Botón QR en la barra flotante (¿abrir el servidor de desarrollo a la red local?). Logo en mayor resolución (hoy 500 px: no se puede agrandar sin perder nitidez).

## Dónde manejar cada cosa
| Tema | Dónde |
|---|---|
| Esta web (código, textos, deploy) | Chat abierto en `detras-del-cartel` |
| Panel de apps (8002) | `inmovalue-brain-app` |
| Ecosistema Inmovalue (CRM, webpage, etc.) | Sus propios chats. Esta app no interviene. |
