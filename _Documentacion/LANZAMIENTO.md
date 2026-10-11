# EL DÍA QUE SE LANZA — abrir el sitio a los buscadores

> Escrito el 11-10-2026, relevado contra el código y verificado contra la web publicada.
> **Hoy el sitio está CERRADO a Google a propósito.** Está en internet, funciona, se puede
> compartir el enlace y entra cualquiera que lo tenga — pero no aparece en las búsquedas.

## Por qué está cerrado

El podcast todavía no publicó su primer episodio. Si Google entrara hoy, indexaría una página
que dice «Muy pronto: el primer episodio» y esa sería la primera impresión que daría el sitio
durante semanas, porque **lo que Google guarda no se borra cuando vos cambiás la página**: tarda
en volver a pasar. Es más barato abrirle la puerta el día que hay algo adentro.

🔴 **La decisión es de Vic y la fecha también.** Esto no se abre «por las dudas» ni «mientras
tanto»: se abre el día del primer episodio.

---

## Lo que hay que cambiar: son TRES cosas

El sitio está cerrado por **cuatro capas distintas**, y eso es a propósito — si una falla, las
otras siguen. Tres se abren y **una se queda**.

### 1. `app/layout.jsx` — lo que dice el HTML de cada página

```js
export const metadata = {
  title: 'Detrás del Cartel',
  description: 'Podcast inmobiliario',
  // Mientras el podcast no lance, el sitio entero está cerrado a los buscadores.
  // AL LANZAR: sacar este bloque de acá y el `Disallow: /` de public/robots.txt.
  robots: { index: false, follow: false, nocache: true },   // ← BORRAR ESTA LÍNEA
}
```

**Qué hace hoy:** pone `<meta name="robots" content="noindex, nofollow, nocache">` dentro del
HTML de todas las páginas. Es la señal que lee Google cuando ya entró a la página.

**Al lanzar:** borrar la línea entera y el comentario de arriba.

### 2. `next.config.mjs` — la cabecera que viaja con cada respuesta

En la lista `COMUNES`, la primera línea:

```js
const COMUNES = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },   // ← BORRAR ESTA LÍNEA
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  ...
]
```

**Qué hace hoy:** manda la misma orden en la cabecera de la respuesta, antes de que el navegador
mire el HTML. Es la más fuerte de las tres: vale incluso para archivos que no son páginas.

⚠️ **Borrar SÓLO esa línea.** Las otras cinco de esa lista son las de seguridad y no se tocan.

### 3. `public/robots.txt` — el cartel de la entrada

```
# Hoy el sitio entero está cerrado a los buscadores (todavía no se lanzó).
User-agent: *
Disallow: /                      ← BORRAR ESTA LÍNEA (y el comentario de arriba)

# AL LANZAR: se borra el "Disallow: /" de arriba, pero ESTAS DOS LÍNEAS QUEDAN.
# El buzón tiene consultas de personas y nunca se indexa.
Disallow: /consultas
Disallow: /api/
```

**Qué hace hoy:** le dice al robot que no entre a ninguna parte. Es lo primero que lee, antes de
pedir una sola página.

**Al lanzar:** borrar `Disallow: /` y su comentario. **Las dos líneas de abajo quedan.**

### ✅ Esta lista está PROBADA, no supuesta

El 11-10-2026 se aplicaron los tres cambios **en seco** —en la máquina, sin publicar—, se compiló
y se midió el resultado. Dio exactamente esto:

| | Resultado |
|---|---|
| La portada | ✅ sin etiqueta `robots` en el HTML y sin cabecera `X-Robots-Tag` → **abierta** |
| `/consultas` | ✅ `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` + `Cache-Control: no-store` → **sigue cerrado** |
| `/api/episodios` | ✅ `X-Robots-Tag: noindex, nofollow` → **sigue cerrado** |
| `robots.txt` | ✅ queda sólo `Disallow: /consultas` y `Disallow: /api/` |

Después se revirtió todo. **Si el día del lanzamiento el resultado no es ese, algo cambió en el
medio: parar y revisar antes de publicar.**

---

## 🔴 LO QUE NO SE TOCA NUNCA — cuatro cosas

El buzón tiene consultas de personas con su nombre, su mail y su teléfono. **Que esa página
nunca aparezca en Google no es una preferencia, es la obligación que asumimos en la política de
privacidad.** Está protegido por cuatro capas independientes y **las cuatro se quedan**:

| Dónde | Qué dice | Por qué queda |
|---|---|---|
| `public/robots.txt` | `Disallow: /consultas` y `Disallow: /api/` | El robot ni siquiera pide la página |
| `next.config.mjs` (regla de `/consultas`) | `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` + `Cache-Control: no-store` | Si igual entra, se le dice que no la guarde — ni un fragmento |
| `next.config.mjs` (regla de `/api/:path*`) | `X-Robots-Tag: noindex, nofollow` | Los endpoints tampoco se indexan |
| `src/Consultas.jsx` (líneas ~92-93) | Escribe una etiqueta `robots` al abrir la página | Cuarta red, puesta desde la propia pantalla |

📌 **`/privacidad` SÍ se indexa** y conviene que así sea: es la página que respalda el
formulario. No tiene ninguna regla propia, así que al abrir el sitio queda abierta sola.

---

## Cómo verificar que quedó bien, el mismo día

Tres comandos. Lo que tiene que dar:

```bash
# 1. La portada YA NO debe decir noindex, ni en el HTML ni en la cabecera
curl -s https://detrasdelcartel.com/ | grep -i 'name="robots"'     # → sin resultados
curl -sI https://detrasdelcartel.com/ | grep -i 'x-robots-tag'     # → sin resultados

# 2. El buzón TIENE que seguir cerrado
curl -sI https://detrasdelcartel.com/consultas | grep -i 'x-robots-tag'
# → x-robots-tag: noindex, nofollow, noarchive, nosnippet

# 3. El cartel de la entrada
curl -s https://detrasdelcartel.com/robots.txt
# → NO debe estar "Disallow: /"  ·  SÍ deben estar /consultas y /api/
```

🔴 **El paso 2 es el que importa.** Si al abrir el sitio se abre también el buzón, quedan
expuestas consultas de personas. **Si el paso 2 falla, volver atrás el deploy y revisar antes de
seguir.**

Después, en Google Search Console: dar de alta `detrasdelcartel.com` y pedir la indexación de la
portada. Sin eso puede tardar semanas en pasar solo.

---

## 🔴 ABRIR EL NOINDEX NO ALCANZA — lo que falta para que funcione

**Auditado contra la web publicada el 11-10-2026.** Sacar el `noindex` es necesario y no es
suficiente: si se abre con lo que hay hoy, Google indexa una página que no dice qué es ni dónde
está, y compartirla no muestra nada.

| Qué | Hoy | Por qué importa |
|---|---|---|
| Título | `Detrás del Cartel` | Es el renglón azul del resultado de Google. No dice que es un podcast |
| Descripción | `Podcast inmobiliario` (19 car.) | Es el texto gris debajo. Google muestra hasta ~155 |
| Canónica | **no está** | Con dominio + www + la dirección de Vercel sirviendo lo mismo, Google puede tomarlas como páginas distintas |
| Vista previa (Open Graph) | **ninguna de las 6** | Pegar el enlace en WhatsApp, Instagram o LinkedIn muestra la dirección pelada |
| Datos estructurados | **no están** | Es lo que le dice a Google y a las IA que esto es un **podcast**, quiénes lo conducen y dónde |
| Sitemap | **404** | Para 3 páginas no es crítico, pero acelera |
| «Buenos Aires» en el texto | **0 veces** | 🔴 |
| «Argentina» en el texto | **0 veces** | 🔴 |

### 🔴 Lo geográfico es lo más grave, y es invisible

Es un podcast sobre el mercado inmobiliario **porteño**, y en toda la página **no aparece ni la
ciudad ni el país**. Ni un buscador ni una IA tienen cómo ubicarlo. Alguien que pregunta «podcast
inmobiliario en Buenos Aires» no lo va a encontrar, porque la página nunca dice esas palabras.

Se arregla en dos lugares, y conviene hacer los dos:

1. **En el texto visible**, que es lo que de verdad leen las IA —no las etiquetas ocultas—.
   Alcanza con que la bajada o el bloque «Juntos» nombre Buenos Aires de forma natural.
2. **En los datos estructurados**, con el campo de área de cobertura.

### Qué hay que definir, concretamente

Esto es lo que hay que decidir **antes** del día del lanzamiento, no ese día:

| | Qué hay que decidir | Sugerencia para arrancar |
|---|---|---|
| **Título** | ≤ 60 caracteres, con la palabra clave adelante | `Detrás del Cartel — Podcast inmobiliario de Buenos Aires` |
| **Descripción** | 120-155 caracteres, que invite a entrar | Que diga de qué se habla y para quién, nombrando la ciudad |
| **Imagen de vista previa** | 1200×630 px | Puede salir del banner de YouTube, reencuadrado |
| **Dónde ubicarlo** | Ciudad y alcance | CABA + GBA Norte, o «Buenos Aires» a secas |

### Lo técnico, que lo resuelvo yo cuando estén las decisiones

- `metadataBase` + bloque `openGraph` y `twitter` en `app/layout.jsx`
- `alternates.canonical` apuntando siempre al dominio sin www
- JSON-LD de tipo **PodcastSeries** con los dos conductores y el área de cobertura
- `app/sitemap.js` (Next lo genera solo) con las dos páginas públicas — **nunca `/consultas`**

⚠️ **Todo esto se publica ANTES de sacar el noindex, no después.** Si Google entra primero y
guarda la versión pobre, corregirlo después tarda semanas: lo que ya indexó no se borra porque
uno cambie la página.

---

## El resto del lanzamiento, que no es de buscadores

Esto vive en el `HANDOVER.md`, sección de pendientes. Lo nombro acá para que no se pisen:

- Publicar el primer episodio en YouTube (público, 16:9, título que empiece con `#1 · `).
  La web lo levanta sola: no hay que tocar nada del código.
- Publicar el programa en Spotify for Creators — recién ahí nace el feed RSS.
- Enviar el feed a Apple Podcasts y pegar el enlace cuando lo asignen.
- Pasar la cuenta de Instagram a pública.
- Repetir el `/security-review` con el sitio ya abierto.

---

## El interruptor de emergencia

Si algo sale mal el día del lanzamiento y hay que **ocultar todo rápido**, en `src/App.jsx`:

```js
sitio: { publicarCompleto: true },    // ← poner en false
```

En `false`, la web publicada muestra sólo el logo y una barra roja de «SITIO EN CONSTRUCCIÓN».
Se cambia el valor y se publica. No borra nada: es una cortina, no una demolición.
