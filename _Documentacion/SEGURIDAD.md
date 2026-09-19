# SEGURIDAD — Detrás del Cartel

> Auditoría 2026-09-18, desde el código (no desde documentación). Marco: reglas de seguridad de Vic (globales) + protocolo `AppEcosystem/protocol/04_SECURITY_RULES.md`.

## Reglas que aplican igual que en el ecosistema
1. Directorio prohibido de iCloud: nunca se accede.
2. Sin tokens, keys ni datos personales en código, logs, commits ni storage público. Variables de entorno siempre.
3. `.env` en `.gitignore` (hecho). Secrets solo en variables del hosting.
4. `/security-review` antes de CADA deploy.
5. Ante la duda entre exponer o no: NO.

## Resultado de la auditoría
| Punto | Estado |
|---|---|
| Secretos / tokens / `.env` en el código | ✅ Ninguno |
| `eval`, `innerHTML`, `dangerouslySetInnerHTML`, `localStorage`, cookies | ✅ Ninguno |
| Llamadas de red del código (`fetch`, XHR, axios) | ✅ Ninguna |
| `target="_blank"` | ✅ Con `rel="noreferrer"` |
| Formulario "Enviar Caso" | 🟡 Sigue siendo maqueta en el prototipo local, pero NO viaja al sitio publicado (verificado en el bundle). Resolver antes de activarlo |
| Datos personales | 🔴 Cuando el formulario sea real recolecta nombre, email y relato del caso → requiere backend, validación, antispam, consentimiento y política de privacidad |
| Recursos de terceros | ✅ El sitio publicado no carga nada externo (0 URLs en HTML/CSS/JS). Las fotos de Unsplash solo existen en el prototipo local |
| `npm audit` | ✅ 0 vulnerabilidades en dependencias de producción. 🟡 2 en desarrollo (esbuild/vite, solo servidor local). Fix = subir Vite (cambio mayor) |
| Headers de seguridad | ✅ En `vercel.json` (CSP, HSTS, nosniff, frame DENY, Referrer, Permissions-Policy, X-Robots-Tag). Validar en el primer deploy real |
| `.gitignore` | ✅ Creado 2026-09-18 |
| Enlaces a canales | 🟡 Genéricos, no son los del podcast |

## Aislamiento respecto del ecosistema (decisión Vic, 2026-09-18)
- GitHub y Vercel en **cuenta distinta** de la que usa Vic para sus otros proyectos.
- **Supabase propio** si hace falta base. Nunca compartir base con otros proyectos.
- El repo tiene `credential.helper` vacío para no heredar el helper de credenciales global de la Mac.
- Servidor de desarrollo solo en 127.0.0.1 (mitiga el esbuild advisory: ningún sitio web puede leerlo desde la red).

## Antes del primer deploy (checklist)
- [x] Formulario fuera del sitio publicado (al activarlo: real y seguro)
- [x] Sin recursos externos en el sitio publicado
- [ ] Links reales de canales
- [x] `vercel.json` con headers de seguridad
- [x] `npm audit` reevaluado (0 en producción)
- [ ] `/security-review` corrido y sin hallazgos abiertos
- [ ] Verificar `git ls-files` sin `.env`, tokens ni datos personales
- [ ] Cuentas propias creadas y logueadas de forma aislada (ver `RUNBOOK.md`)

## Revisión pre-deploy — 2026-09-19 (hecha a mano: el skill /security-review no corre sin `origin/HEAD`)
- Archivos a subir revisados: sin secretos, tokens, teléfonos ni mails.
- `package-lock.json`: los 177 paquetes vienen de `registry.npmjs.org`.
- Build: 0 sourcemaps, 0 scripts inline, 0 recursos externos.
- Corregido: los docs nombraban la cuenta de Vercel y la base de otros proyectos → se quitaron para no cruzar identidades si el repo se hiciera público.
- Corregido: `start.command` usaba la ruta absoluta del usuario → ahora relativa al propio script.
- Pendiente para el lanzamiento real: rehacer esta revisión con el contenido final y el formulario.
