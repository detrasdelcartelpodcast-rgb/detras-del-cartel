# RUNBOOK — Detrás del Cartel

## Correr en local
- Doble clic en `start.command`, o "▶ Abrir" en el panel del 8002 (`http://localhost:8002`).
- Manual: `npm install` y `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
- Frenar: `lsof -ti:5173 | xargs kill` (por puerto, nunca `pkill`).

## Build
`npm run build` → `dist/` (estático). Probar: `npm run preview`.

## Publicar en cuentas propias (PENDIENTE — requiere que Vic cree las cuentas)
> Regla: nada de esto se hace con las credenciales de Inmovalue. Los tokens nunca se pegan en el chat ni se guardan en el repo.

1. **GitHub:** crear la cuenta/organización propia y un repo (privado al comienzo). Autenticar con una **clave SSH dedicada** (`~/.ssh/id_ed25519_cartel` + alias de host en `~/.ssh/config`) o un token fino guardado fuera del repo. No usar el helper global.
2. **Git local:** identidad solo para este repo (`git config --local user.name` / `user.email` con los datos de la cuenta nueva). Primer commit recién después de verificar `git status` sin secretos.
3. **Vercel:** cuenta distinta. Loguearse con un directorio de configuración aparte para no pisar la sesión de Inmovalue: `vercel login --global-config ~/.vercel-cartel` (y usar siempre `--global-config ~/.vercel-cartel`). Verificar con `vercel whoami --global-config ~/.vercel-cartel` que corresponda a la cuenta NUEVA y no a la que usa Vic en otros proyectos.
4. **Deploy:** framework Vite, build `npm run build`, salida `dist`. Variables de entorno solo en el panel de Vercel.
5. **Antes de publicar:** completar el checklist de `SEGURIDAD.md` y correr `/security-review`.
6. **Dominio:** pendiente de definir.

## Backup
Decisión pendiente de Vic. Hasta entonces, el código vive solo en la Mac (Time Machine) y, cuando exista, en el repo de GitHub propio.
