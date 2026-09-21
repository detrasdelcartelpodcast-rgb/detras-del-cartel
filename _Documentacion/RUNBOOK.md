# RUNBOOK — Detrás del Cartel

## Correr en local
- Doble clic en `start.command`, o "▶ Abrir" en el panel del 8002 (`http://localhost:8002`). Se ve en `http://localhost:5173`.
- Manual: `npm install` y `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
- Frenar: `lsof -ti:5173 | xargs kill` (por puerto, nunca `pkill`).
- En local, `/api/episodios` funciona sin clave usando el feed (roto) → aparece "Muy pronto". Para probar con la clave real: `YOUTUBE_API_KEY=… npm run dev` (solo en esa terminal; **nunca** guardarla en un archivo del repo).
- Probar otro canal solo en tu Mac: `YOUTUBE_CHANNEL_ID=UC… npm run dev` (jamás subirlo a Vercel).
- Vistas útiles: `?demo=1` (episodios de ejemplo), `?produccion=1` (vista en construcción).

## Pruebas
- `npm run probar` → 31 pruebas del servidor (sin red).
- `npm run build` → `dist/`. Verificar que no viajen ejemplos: `cat dist/assets/*.js | grep -c "demoAAAAAA"` debe dar 0.

## Publicar
1. Commit local. 2. `/security-review` (regla fija). 3. `git push origin main` (usa la clave SSH `github-cartel`). 4. Vercel despliega solo (~30 s). 5. Verificar en vivo: `https://detras-del-cartel.vercel.app/api/episodios` y la página.
- **Volver atrás:** `git revert <commit>` + push (o `git reset --hard <commit>` en local y `git push --force` solo si Vic lo autoriza). Puntos de retorno con tag: `checkpoint-antes-de-logos`.
- **Ocultar todo rápido:** `siteConfig.sitio.publicarCompleto = false` en `src/App.jsx` y push.

## Subir un episodio nuevo (Vic)
1. YouTube Studio → Crear → Subir video. **Horizontal 16:9, Público** (no listado o privado NO aparecen en la web).
2. **Título:** `#N · Título del episodio` (la web muestra "Nº N").
3. **Descripción:** ARRIBA, 2 líneas propias del episodio (son el resumen que muestra la web); DEBAJO, el texto fijo del canal (se pre-carga solo).
4. "¿Es para niños?": No. Miniatura personalizada (requiere teléfono verificado).
5. En ~5 min aparece en la web como "Último episodio"; el anterior pasa a "Episodios anteriores".
6. Para sacar uno de la web: pasarlo a **Privado** o No listado (tarda hasta ~5 min).

## Cuentas y variables
- **GitHub** `detrasdelcartelpodcast-rgb` (SSH `github-cartel`), **Vercel** equipo `detrasdelcartel`, **Google Cloud** proyecto `detras-del-cartel`.
- Variable en Vercel: `YOUTUBE_API_KEY` (Production). Cambiarla: Settings → Environment Variables → editar → **Redeploy** (solo aplica a despliegues nuevos).
- **Rotar la clave:** ver `SEGURIDAD.md` → "Si se compromete la clave".

## Conectar el dominio `detrasdelcartel.com` (pendiente)
1. Vercel → proyecto → Settings → Domains → agregar `detrasdelcartel.com` (y `www`). Vercel muestra los registros DNS exactos.
2. Hostinger → Dominios → DNS / zona DNS: reemplazar los registros del "dominio estacionado" (A del dominio y CNAME de `www`) por los que indicó Vercel. El dominio no tiene MX (no se corta ningún correo).
3. Esperar la propagación (minutos a horas) y verificar HTTPS. Los headers de `vercel.json` aplican igual.

## Regenerar el banner de YouTube
`python3 tools/componer-banner-youtube.py` (editar la ruta de la imagen fuente dentro del script). Salida 2560×1440 con todo el contenido dentro de la zona segura de 1546×423.

## Exportar logos desde Stitch
Seleccionar la pantalla → Exportar → `.zip` → `screen.png` (1024 px). Renombrar al bajarlo. Pedir **imagen**, no "React/SVG" (ver `HANDOVER.md`, trampas).

## Backup
Decisión pendiente de Vic. Hoy: la Mac (Time Machine) + el repo privado de GitHub.
