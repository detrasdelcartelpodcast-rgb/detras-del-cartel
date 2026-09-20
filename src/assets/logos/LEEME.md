# Logos de Detrás del Cartel — inventario

> Guardados el 20-09-2026 tal como los entregó Vic (copias; los originales siguen en su Mac). Estos archivos NO se publican: mientras no estén importados por el código, el build los descarta. Los que se usen quedan optimizados en `src/assets/` cuando se armen en la web.

| Archivo | Tamaño | Qué es | Notas / problemas |
|---|---|---|---|
| `01-circular-cobrizo-en-venta-real-estate.jpg` | 2048×2048 | Emblema redondo cobrizo, "EN VENTA", micrófono, "REAL ESTATE PODCAST" | **Alta resolución.** Texto "DETRÁS DEL CARTEL" **cortado en los bordes** (falta la D y la L). Slogan en inglés. |
| `10-circular-cobrizo-en-venta-completo-1024.png` | 1024×1024 | **Exportado de Stitch (Exportar → .zip → `screen.png`)**. Emblema redondo cobrizo, "EN VENTA", micrófono, planos, "DETRÁS DEL CARTEL / REAL ESTATE PODCAST" | **Nombre completo, sin cortar** (corrige al 01). Es el que Vic propuso para la web. Pendientes: slogan en inglés, "EN VENTA" (vs "SE VENDE"), fondo BLANCO sin transparencia (en modo noche va dentro de una tarjeta blanca), y mucho detalle: no sirve a 36 px (para el menú, usar el mini logo simple). 1024 px alcanza para ~500 px en pantalla; en pantallas retina se ve algo blando. |
| `02-cartel-naranja-lo-que-no-te-cuentan-A.png` | 271×276 | Cartel naranja con esquina despegada + micrófono, "LO QUE NO TE CUENTAN" | Baja resolución (captura). |
| `03-cartel-naranja-lo-que-no-te-cuentan-B.png` | 270×272 | Variante de la anterior, "EN VENTA" | Baja resolución (captura). |
| `04-for-sale-en-venta-verde.png` | 275×275 | Cartel navy/verde con esquina despegada, "FOR SALE / EN VENTA", tipografía serif | Baja resolución. Bilingüe. |
| `05-hexagono-podcast.png` | 274×271 | Hexágono con cartel, micrófono y ondas, "DETRÁS DEL CARTEL PODCAST" | Baja resolución. Sin "inmobiliario". |
| `06-circular-se-vende-podcast-inmobiliario.png` | 277×277 | Círculo, "SE VENDE" con esquina despegada revelando el micrófono, "PODCAST INMOBILIARIO" | Baja resolución. **Candidato a logo principal** (ilustra "lo que hay detrás del cartel"). |
| `07-plano-se-vende-con-nombres.png` | 265×260 | Versión plana azul/naranja, "SE VENDE", "CON DANIEL BRYN & VÍCTOR MIASCOVSKY" | Baja resolución aquí. El mismo logo en 500×507 es `public/logo.png` (el que usa hoy el sitio público). |
| `vector/08-cartel-despegado-lo-que-no-te-cuentan.svg` y `vector/08-CartelDespegadoLogo.jsx` | vectorial 700×700 | Logo en CÓDIGO (SVG y componente React) generado por otra herramienta: cartel "EN VENTA" con esquina despegada, planos, micrófono, "DETRÁS DEL CARTEL / LO QUE NO TE CUENTAN" | **Seguro** (solo formas, sin scripts ni enlaces externos). **El dibujo no coincide con lo que promete:** el micrófono queda tapado por el cartel (solo asoman las ondas y las cotas), la solapa dorada cubre "VENTA" (se lee "VENT"), y la tipografía usa Impact / Arial Black / Plus Jakarta Sans como texto vivo (en celulares cambia; convendría pasar el texto a trazos). Usa "EN VENTA" y el slogan que aún no se decidió. |
| `vector/09-emblema-split-real-estate-podcast.svg` y `vector/09-DetrasDelCartelSplitEmblem.jsx` | vectorial 1024×1024 | Emblema redondo partido (cartel EN VENTA a la izquierda, estudio a la derecha), "REAL ESTATE PODCAST" | **Seguro** (sin scripts ni enlaces). **Es una recreación pobre del 01:** dibujo mucho más simple, micrófono y cartel diminutos, el nombre se pisa con el aro. Texto en inglés. |
| `../banners/banner-youtube-v2.jpg` | 2848×1490 | Banner con cartel de madera, micrófono y ciudad | Ver problemas abajo. |

## Pendiente / a corregir antes de usar
- **Redacción unificada:** hoy conviven "EN VENTA", "SE VENDE" y "FOR SALE", y slogans "Real estate podcast", "Podcast inmobiliario" y "Lo que no te cuentan". Definir UNA.
- **"Lo que no te cuentan"** (logos 02, 03, 04): insinúa que otros ocultan información; es más directo que el criterio acordado (no apuntar a colegas, el "hay de todo" va implícito). Decisión de Vic.
- **Resolución:** salvo el 01 (2048 px), los logos son capturas de ~270 px. Sirven para íconos/pruebas, NO para el hero grande (se ven borrosos). Piden los originales de la herramienta que los generó.
- **Banner:** dice `DETRASCARTEL.COM` (el dominio real es **detrasdelcartel.com**); repite "Nuevos episodios todos los meses" y "Nuevos episodios cada semana" (se contradicen); promete "Entrevistas" y frecuencia (validar que sea cierto). Para YouTube hay que reencuadrarlo a 2560×1440 con zona segura central de 1546×423.
- **Falta el ícono** "micrófono sobre cartel de madera" (fondo circular oscuro): la imagen pegada en el chat no quedó en disco. Pedir el archivo.

## Cómo exportar desde Stitch (probado 20-09)
Seleccionar la pantalla del logo → **Exportar → .zip** → el zip trae `screen.png` (1024×1024, sin transparencia). Siempre se llama igual: **renombrar cada uno al descargarlo** (o pasar uno por vez y avisar cuál es).

## Cómo mirarlos
- `http://localhost:5173/logos-preview.html` (solo desarrollo; NO se publica: no forma parte del build). Muestra los logos en grande, en tamaño chico y sobre fondo oscuro.

## Lección (20-09): el código que da Stitch/Gemini NO es fiel al diseño
El logo "en código" (08 y 09) es una **recreación hecha por un modelo de texto**, no el dibujo que se ve en Stitch: sale más simple y con errores (micrófono tapado, texto cortado, composición reducida). **La fuente de verdad es la IMAGEN** (PNG/JPG de alta resolución). Para pedir algo exacto: exportar la imagen tal cual (PNG 2048 px, fondo transparente), NO pedir "React" ni "SVG". El vectorial solo se justifica para marcas muy simples (como el mini logo del menú, que dibuja Claude).
