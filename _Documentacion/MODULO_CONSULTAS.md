# MÓDULO CONSULTAS — formulario público + buzón privado

> Creado el **2026-09-27**. Reemplaza al `mailto:` que tenía "Proponé un tema".
> Es el primer módulo de esta app que **guarda datos de personas**. Leer entero antes de tocar nada.

---

## Qué es y para qué

La gente escribe desde la web (un tema para el programa, una consulta privada o un caso
anónimo) y eso queda guardado en una base propia del podcast. Vic y Daniel lo siguen desde
`/consultas`, una pantalla privada con login de Google.

**Por qué se hizo** (Vic, 27-09): en el mail las consultas se perdían y no se podía hacer
seguimiento. Además, si el corazón del podcast es que los temas los traiga la gente, ese
material es la agenda de contenidos, no correspondencia.

**Lo que NO es:** no es captación. La web informa y crea comunidad; no ofrece servicios ni
pide contratar. Por eso el formulario **no tiene** una opción del tipo "quiero que me
asesoren": quien quiera avanzar lo dice él, respondiendo el mail.

---

## Los tres caminos del formulario

La primera pregunta ("¿Cómo preferís que lo tratemos?") decide todo lo demás:

| Elección | Qué se pide | Qué se guarda |
|---|---|---|
| **Háblenlo en el programa** | tema (obligatorio); nombre, contacto y zona opcionales | todo lo que haya completado |
| **Prefiero que me contesten a mí** | tema + **mail o WhatsApp** (con uno alcanza) | todo; sin permiso de uso (no sale al aire) |
| **Prefiero no dar mi nombre** | solo el tema y el detalle | **nada más**: ni nombre, ni contacto, ni zona, ni origen |

🔴 **El anonimato es real y está garantizado en dos capas**, no por la pantalla:
1. El servidor (`api/_lib/consultas.js`) **borra** todo dato de contacto cuando el tipo es
   anónimo, sin confiar en lo que mande el navegador.
2. La base lo vuelve a rechazar con la restricción `anonima_sin_datos`.

**Probado:** se mandó a propósito una consulta anónima con nombre, mail, teléfono y zona; se
guardó con cero datos. Tampoco se guarda la IP en ningún caso (el freno contra avalanchas es
un conteo global por minuto, justamente para no tener que guardarla).

---

## Cómo está armado

```
  Navegador                      Servidor                      Supabase
  ─────────                      ────────                      ────────
  src/Formulario.jsx  ──POST──►  app/api/consulta/route.js ┌─► consultas
  (landing, público)             api/_lib/consultas.js ───┤   consulta_notas
                                 (clave SECRETA)          └─► autorizados
                                                               ▲
  src/Consultas.jsx  ────────────────────────────────────────┘
  (/consultas, privado)          lee y escribe con la clave PÚBLICA
                                 + sesión de Google; RLS decide qué ve
```

- **Escribir** solo puede el servidor, con la clave secreta. El navegador **no puede insertar**
  (no hay política de `INSERT` para el público).
- **Leer y modificar** lo hace el navegador del que entró, con la clave pública. Lo que lo
  habilita es la sesión de Google y estar en la tabla `autorizados`.

### Archivos

| Archivo | Qué hace |
|---|---|
| `src/Formulario.jsx` | El formulario de la landing. Arranca **cerrado** (solo el botón) y se despliega al tocarlo. |
| `app/api/consulta/route.js` | `POST /api/consulta`. Era `api/consulta.js` hasta el 11-10-2026. |
| `api/_lib/consultas.js` | Validación y escritura. **Acá vive la clave secreta.** |
| `src/Consultas.jsx` | La pantalla `/consultas`: login, lista, filtros, bitácora, papelera, exportación. |
| `src/lib/supabase.js` | Cliente del navegador (clave pública). |
| `src/lib/excel.js` | Genera el `.xlsx` a mano (sin librerías de afuera: la CSP no permite cargar nada externo). |
| `src/main.jsx` | Ruteo mínimo: `/consultas` o la landing. El buzón se carga aparte (ver abajo). |
| ~~`vite.config.js` → `apiConsultaLocal()`~~ | **Ya no existe** (11-10-2026). Con Vite había que escribir un plugin para que `/api/consulta` funcionara en localhost con el mismo código que en Vercel. Con Next el endpoint es el mismo archivo en los dos lados: no hay nada que duplicar ni que se pueda desincronizar. |
| `sql/01_consultas.sql` · `02_bitacora.sql` · `03_mail_sin_trucos.sql` · `04_telefono_de_verdad.sql` | Esquema, permisos y correcciones. Se corren en el SQL Editor. |
| `lib/telefono.js` | 🔴 **La regla del teléfono, en un solo lugar.** La usan el formulario, el servidor y el botón de WhatsApp del buzón. Si se copia en cada uno, el que se equivoca es quien carga la consulta. |

**El buzón se carga aparte a propósito** (`React.lazy`): el cliente de Supabase pesa 251 KB,
más que todo el resto del sitio. Quien entra a la landing no lo descarga.

---

## Las tablas

### `consultas`
Número correlativo visible (`#0001`), fecha, tipo, tema, detalle, datos de contacto, y el
seguimiento nuestro. **Tres ejes separados a propósito** (decisión de Vic, 27-09):

1. **Situación**: `nueva` → `en_curso` → `cerrada`. Nada más.
2. **Próximo paso** + **Recordar el**: solo mientras está en curso.
3. **Cómo terminó** (`desenlace`): solo al cerrar — salió en el episodio N, respondida,
   descartada, o **duplicada de otra**.

🔑 **Lo de "duplicada" no es un detalle**: el mismo tema llega muchas veces con distintas
palabras. Al cerrarlas apuntando a la original, esa original queda con la cuenta de cuánta
gente preguntó lo mismo. **Ese es el dato que dice cuál es el próximo episodio.**

La base impide estados incoherentes: no se puede cerrar sin decir cómo terminó, ni poner un
desenlace en una consulta abierta, ni decir "salió en el episodio" sin el número.

### `consulta_notas` — la bitácora
Cada anotación con su fecha y su autor. Reemplaza al campo único de observaciones, que se
pisaba. Cada uno firma lo suyo: la base **no deja anotar en nombre de otro** ni editar lo que
escribió el otro. La última anotación se ve en la lista, con un ✎ adelante.

Anotar algo pasa la consulta de "nueva" a "en curso" sola.

### `autorizados`
Quién puede ver el buzón. **Decisión de Vic (27-09): los dos entran con la MISMA cuenta, la del
proyecto (`detrasdelcartelpodcast@gmail.com`), que ya comparten.** No se suma a Daniel como
usuario aparte.

Qué implica, para tenerlo claro:
- ✅ Más simple: no hay que prender los registros nuevos para el primer ingreso de nadie, y
  "Allow new users to sign up" queda apagado para siempre.
- ⚠️ **La bitácora no distingue quién escribió cada anotación**: todas van firmadas con la
  dirección del proyecto. El sistema está preparado para firmar por persona (la base impide
  anotar en nombre de otro), pero con una cuenta compartida esa ventaja no se usa. Si algún día
  quieren saber quién anotó qué, se agrega la dirección personal de cada uno con una línea
  (`insert into autorizados …`) y hay que prender los registros nuevos para ese primer ingreso.

---

## Seguridad — lo que se probó, no lo que se supone

Auditoría del 27-09 (`/security-review` + pruebas contra Postgres y contra la base real):

| Intento | Resultado |
|---|---|
| Leer las consultas con la clave pública (la que está en el JS publicado) | Devuelve **vacío** |
| Escribir o borrar directo con la clave pública | **Rechazado** por RLS |
| Entrar con **otra cuenta de Google** y ver la lista | **0 consultas, 0 anotaciones, 0 autorizados** — y desde el 27-09 se le muestra "esta cuenta no tiene acceso" en vez del buzón vacío |
| Un desconocido agregándose a `autorizados` | **Rechazado** |
| Un desconocido modificando o borrando consultas | **Rechazado** |
| Un autorizado anotando **firmando como otro** | **Rechazado** |
| Robot que completa en 0,1 s · robot que cae en el campo trampa | **Rechazados** |
| 13 envíos seguidos | Frena en el 10 |
| Consulta anónima mandando datos a propósito | Se guarda **sin ningún dato** |

### 🔴 Agujero encontrado y tapado el 27-09 (leer: se puede repetir)
La validación del mail dejaba pasar `victima@mail.com?bcc=atacante%40evil.com`. Al apretar
**"Responder por mail"** en el buzón, el programa de correo abría el mensaje **con una copia
oculta hacia un tercero**: la respuesta a una consulta privada —una herencia, un divorcio— se
le escapaba a alguien de afuera. Lo detectó la revisión de seguridad, no las pruebas.

Corregido en **tres capas**: la validación del servidor rechaza los caracteres de URL
(`? & = % " ' < >`), el enlace del buzón corta la dirección en el primer `?` y la codifica, y
la base lo impide con la restricción `mail_sin_trucos` (`sql/03_mail_sin_trucos.sql`).

**La lección, que vale para todo lo que venga:** un dato que viene de afuera y termina dentro
de una dirección (`mailto:`, `https://`, `tel:`) hay que codificarlo, aunque "ya esté
validado". La validación de un mail no alcanza para meterlo en una URL.

### Una cuenta ajena no ve un buzón vacío: ve que no tiene acceso
Vic probó entrar con otra cuenta de Google y llegaba a la pantalla del buzón, vacía. No había
fuga (la base no le daba ninguna fila), pero era confuso: parecía "todavía no llegó ninguna
consulta". Desde el 27-09, al entrar se le pregunta a la base si esa dirección está en
`autorizados`; si no está, se muestra un cartel claro con la dirección usada y un botón para
salir. **La comprobación se le hace a la base, no a una lista escrita en el navegador.**

### 🟡 Deuda anotada (no es un agujero hoy)
Las políticas se apoyan en el **mail** de la sesión (`auth.jwt() ->> 'email'`) y no en el
identificador de usuario. Hoy no es explotable: el único proveedor habilitado es Google y el
de mail y contraseña está apagado. **Si alguna vez se habilita el login por mail, hay que
cambiar las políticas a `auth.uid()` antes.**

### Al lanzar
- `/consultas` **nunca se indexa**, ni cuando se saque el `noindex` general del sitio. Está en
  tres capas: etiqueta en la página, `robots.txt` (con un comentario que avisa que esas líneas
  quedan) y cabecera `X-Robots-Tag` propia en **`next.config.mjs`** (era `vercel.json` hasta el
  11-10-2026), más `Cache-Control: no-store`.
- Tras el primer login de cada uno, **apagar "Allow new users to sign up"** en Supabase
  (Authentication → Sign In / Providers). No antes: el usuario se crea en el primer ingreso.

---

## Operación

**Variables de entorno** (Vercel → Settings → Environment Variables, y `.env.local` en la Mac):

| Variable | Dónde | Secreta |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | navegador y servidor | no |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | navegador | no (pero sólo sirve con sesión autorizada) |

🔴 **Los nombres cambiaron el 11-10-2026** (`VITE_` → `NEXT_PUBLIC_`): el prefijo es lo que le
dice al compilador cuáles variables puede mandar al navegador, y cada herramienta usa el suyo.
**En Vercel siguen cargadas con los nombres viejos**, así que `lib/consultas.js` acepta los dos
a propósito: si se le quitara la red, el formulario quedaría sin base hasta que alguien
renombre las variables a mano en el panel. Al renombrarlas allá, se puede simplificar.
| `SUPABASE_SECRET_KEY` | **solo servidor** | 🔴 **sí** — nunca al repo, nunca al navegador, nunca al chat |

**Si se compromete la clave secreta:** Supabase → Settings → API Keys → rotar la secret →
actualizarla en Vercel → Redeploy. La publishable no hace falta rotarla (no sirve sin sesión).

**El buzón, día a día:** el borde rojo son los que piden respuesta y no la tuvieron; ⏰ Vencidas
son los que tienen una fecha de "recordar" ya pasada; las cerradas desaparecen de la vista
principal y tienen su filtro. Todo se puede bajar a Excel (`.xlsx` de verdad, con la bitácora).

**Nada se borra:** la papelera es borrado lógico y se puede restaurar.

---

## La política de privacidad (`/privacidad`)

Obligatoria desde que la web guarda datos de personas: la Ley 25.326 exige informar, en el
momento de pedirlos, para qué se usan, quién es el responsable, qué es obligatorio y cómo
ejercer los derechos de acceso, rectificación y supresión. Nadie la controla de oficio (la
AAIP actúa por denuncia), pero **Meta y Google la exigen** el día que haya pauta hacia la web.

Vive en `src/Privacidad.jsx`, se enlaza desde el pie ("Política de privacidad") y desde abajo
del formulario ("Qué hacemos con tus datos"), que es donde legalmente corresponde avisar.

🔴 **Regla:** esa página describe lo que el código REALMENTE hace. Hoy dice que no hay
analítica, ni píxeles, ni cookies de seguimiento, y eso está verificado. **El día que se
agregue analítica, un píxel, una newsletter o se comparta algo con un tercero, se actualiza la
página en el mismo movimiento.** Una política que dice algo que no es cierto es peor que no
tenerla.

Al lanzar: `/privacidad` **sí debe quedar indexable** cuando se saque el `noindex` general
(a diferencia de `/consultas`, que nunca lo es).

⚠️ No la revisó un abogado. Cubre lo que la ley pide informar y describe el sistema con
precisión, pero la inscripción de bases de datos ante la AAIP conviene confirmarla con un
profesional.

## Pendientes de este módulo
- [x] Correr `sql/03_mail_sin_trucos.sql` en Supabase — hecho el 27-09.
- [x] Cargar las tres variables en Vercel — hechas (las dos `VITE_` como *Config*, la secreta como *Secret*).
- [x] Primer login y apagado de los registros nuevos — hecho el 27-09.
- [x] Borrar las consultas de prueba — hecho el 27-09: la base quedó vacía, lista para las reales.
- [x] ~~Sumar a Daniel a `autorizados`~~ — no hace falta: entran los dos con la cuenta del proyecto (Vic, 27-09).
- [ ] Al conectar el dominio: cambiar la **Site URL** de Supabase a `https://detrasdelcartel.com`
      y dejar la de Vercel en Redirect URLs. **Si no se hace, el login rebota.**
- [ ] Revisar los **Security Advisors** de Supabase cada tanto (panel → Advisors).
- [ ] Confirmar con un abogado la inscripción de la base ante la AAIP.


---

## 🔴 EL TELÉFONO (11-10-2026) — antes no se validaba en ninguna capa

**Cómo se descubrió:** probando contra la web publicada entraron `no tengo`, la letra `a` y
`123`. No era un problema de seguridad; era peor para el uso diario:

- Una consulta **privada** pide «dejanos un mail o un WhatsApp». Con cualquier texto se cumplía
  el requisito, y quedaba alguien **esperando respuesta a quien no se podía contestar**.
- Ese texto alimentaba el botón de WhatsApp, que armaba el enlace sacando todo lo que no fuera
  número. **El botón se veía igual de bien en los tres casos** y no llevaba a ninguna parte.

### Lo que hay ahora

| Dónde | Qué hace |
|---|---|
| **El formulario** | Selector de país con bandera, **Argentina por defecto**, y el ejemplo del campo cambia según el país elegido. El campo es `type="tel"`, así en el celular sale el teclado de números (antes salía el de letras). Avisa en el momento si faltan números. |
| **El servidor** (`lib/consultas.js`) | Vuelve a revisar. Es la que no se puede saltear desde el navegador. |
| **La base** (`04_telefono_de_verdad.sql`) | `telefono_de_verdad`: entre 8 y 14 dígitos. Ni con la clave secreta entra un «no tengo». |

Se guarda con el país adelante: **`+54 11 5555 5555`**.

### 🔴 Tres trampas que encontró la prueba de la función, no el ojo

1. **El país duplicado.** Mucha gente tiene el número guardado como «+54 9 11 5555 5555» y lo
   pega entero sin mirar que al lado ya dice +54. Quedaba `+54 +54 9 11…`. `armarTelefono()` le
   saca el país si ya viene.
2. **El 9 argentino.** Para un celular de acá WhatsApp no quiere `54 11 5555 5555` sino
   `54 **9** 11 5555 5555`. Ese 9 no se marca al llamar y nadie lo escribe: lo pone
   `enlaceWhatsApp()`. Sin él WhatsApp dice «el número no está en WhatsApp» y parece que el
   problema es del contacto.
3. **Los números viejos.** Los guardados antes de esto no tienen `+`. El primer intento fue
   adivinar el país mirando con qué dígitos empieza: **no sirve**, porque el `1` de Estados
   Unidos coincide con el principio de cualquier número porteño y «11 555 5555» se tomaba como
   yanqui. Ahora la regla es simple: **sin `+` ⇒ Argentina**.

### Y desde qué cuenta se contesta

El botón «Responder» era un `mailto:` pelado: abría el programa de correo de la Mac con la
cuenta que ese programa tuviera por defecto, así que la respuesta podía salir **desde la
dirección personal de Vic** sin que nada lo avisara. `mailto:` no permite fijar el remitente.
Ahora abre el redactor de Gmail de **detrasdelcartelpodcast@gmail.com** (Vic, 11-10-2026:
*«debería enviarse desde esa»*), y debajo de los botones dice desde qué cuenta sale.

✅ **`sql/04_telefono_de_verdad.sql` corrido el 11-10-2026** (Vic, en el SQL Editor).
Comprobado desde afuera, escribiendo **directo en la base con la clave secreta** —salteando el
formulario y el servidor, que es justamente contra lo que protege—: `no tengo`, `a` y `123`
rebotan con `telefono_de_verdad`, y `+54 11 5555 5555` entra. La regla del mail
(`mail_sin_trucos`) también sigue activa. Las tres capas quedaron cerradas.


---

## Por qué son TRES opciones y no dos (11-10-2026)

Vic lo planteó: *«la tercera, ¿no está contenida en alguna de las otras?»*. Mirado contra el
código, **en parte sí**: en «háblenlo en el programa» el nombre, el contacto y la zona son todos
opcionales, así que alguien que no completa nada queda igual de anónimo.

Lo que la tercera agrega **no es una función, es una promesa**: ahí el anonimato no depende de
que la persona deje los campos vacíos — lo garantizan el servidor y la restricción
`anonima_sin_datos` de la base. Aunque el navegador mande datos, se descartan, y tampoco se
guarda de dónde llegó.

**Se conservan las tres**, y la razón es de contenido, no técnica: alguien que se comió una
estafa o está peleado con los hermanos por una herencia **no** completa un formulario donde los
datos «son opcionales»; completa el que le promete que no se guardan. En un podcast que se llama
*Detrás del Cartel*, ésas son las consultas que valen. La garantía es el producto.

### 🔴 Lo que SÍ estaba mal: la anónima era un callejón sin salida

El tilde de «pueden contar mi caso en el programa» aparecía sólo en la primera opción
(`!anonima && !privada`). Una consulta anónima quedaba entonces **sin forma de contestarla**
—no hay datos— **y sin permiso para contarla**. Lo único que se podía hacer con ella era leerla.

Corregido: el tilde aparece también en la anónima (Vic, 11-10-2026). En ese caso el texto no
promete «sin tu nombre», porque no hay nombre que ocultar: prometer algo que ya es imposible
suena a cláusula y no a cuidado. El buzón lo muestra como *«sí (es anónima: no hay nombre que
ocultar)»*.

### Los dos ejes, para la próxima vez que se toque esto

Las tres opciones mezclan **dos preguntas distintas**: las dos primeras contestan *«¿qué querés
que hagamos con esto?»* y la tercera *«¿cuánto me querés contar de vos?»*. Es la razón de que la
lista se sienta rara. Se deja así a propósito: separarlo en dos preguntas es más correcto y más
largo de completar, y acá lo que se está comprando es que la persona se anime a escribir.

### «(opcional)» en naranja, no en gris

Vic, 11-10-2026: *«para que se note bien que es opcional»*. Se usa `text-accent`, que está
definido para los dos modos. Medido: el gris anterior daba **2,5:1 de contraste** —por debajo
del mínimo legible de 4,5— y el naranja da **11,3:1 de noche y 4,9:1 de día**. O sea que la
etiqueta que avisaba «esto no hace falta» era la menos legible de la pantalla, y la gente
completaba campos creyéndolos obligatorios.

⚠️ El texto del bloque de contacto **cambia de sentido**: en la consulta privada dice «dejanos al
menos uno» y ahí NO es opcional, así que ése se queda en gris. El naranja es sólo para lo que de
verdad se puede saltear.
