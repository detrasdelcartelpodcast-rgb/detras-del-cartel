// Lee el feed PÚBLICO de YouTube del canal del podcast y devuelve datos LIMPIOS para la web.
//
// Seguridad (esta función corre en el servidor de Vercel):
//  - No recibe NINGÚN dato del visitante: el canal es fijo (constante o variable de entorno del deploy).
//  - Solo se pide una URL de youtube.com construida acá; sin redirecciones.
//  - El XML se procesa con expresiones simples (sin parser XML => sin XXE ni entidades externas).
//  - Cada campo se valida, se recorta y se limpia de caracteres de control antes de salir.
//    (React escapa el texto al mostrarlo; acá además se deja de transportar basura.)
//  - Tiempo máximo y tamaño máximo de la respuesta de YouTube.

// Canal "Detrás del Cartel". Para probar con otro canal SOLO en tu Mac: YOUTUBE_CHANNEL_ID=UC... npm run dev
export const CANAL_POR_DEFECTO = 'UCRVH9mlcrwMockg7aTbOr-Q';

const TIMEOUT_MS = 6000;
const MAX_BYTES = 1_000_000;
const MAX_EPISODIOS = 12;

export function canalId(env = process.env) {
  const id = String(env.YOUTUBE_CHANNEL_ID || CANAL_POR_DEFECTO).trim();
  if (!/^UC[A-Za-z0-9_-]{22}$/.test(id)) throw new Error('ID de canal inválido');
  return id;
}

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodificar(texto) {
  return texto
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&(#x[0-9a-fA-F]{1,6}|#\d{1,7}|amp|lt|gt|quot|apos);/g, (m, e) => {
      if (e[0] !== '#') return ENTIDADES[e];
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : '';
    });
}

// Deja texto plano: sin caracteres de control ni marcas de dirección de texto.
// (Se escriben con \u para que el archivo no contenga caracteres invisibles.)
const CONTROL = new RegExp('[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f\\u202a-\\u202e\\u2066-\\u2069]', 'g');

function limpiar(texto, max) {
  return texto
    .replace(CONTROL, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);
}

function campo(bloque, nombre) {
  const m = bloque.match(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`));
  return m ? decodificar(m[1]) : '';
}

// Resumen = las dos primeras líneas no vacías de la descripción.
function resumir(descripcion) {
  const lineas = limpiar(descripcion, 4000).split('\n').map((l) => l.trim()).filter(Boolean);
  return lineas.slice(0, 2).join(' ').slice(0, 240);
}

export function parsearFeed(xml) {
  if (typeof xml !== 'string') return [];
  const entradas = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const episodios = [];
  for (const e of entradas) {
    const id = campo(e, 'yt:videoId').trim();
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) continue; // sin ID válido no hay reproductor
    const titulo = limpiar(campo(e, 'title'), 160);
    const t = Date.parse(campo(e, 'published'));
    if (!titulo || Number.isNaN(t)) continue;
    episodios.push({
      id,
      titulo,
      fecha: new Date(t).toISOString(),
      resumen: resumir(campo(e, 'media:description')),
    });
  }
  episodios.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)); // más nuevo primero
  return episodios.slice(0, MAX_EPISODIOS);
}

export async function obtenerEpisodios(env = process.env, fetchFn = fetch) {
  const canal = canalId(env);
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${canal}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetchFn(url, { signal: ctl.signal, redirect: 'error', headers: { 'User-Agent': 'DetrasDelCartel-Web/1.0' } });
    if (!r.ok) throw new Error(`YouTube respondió ${r.status}`);
    const buf = await r.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error('respuesta demasiado grande');
    return { ok: true, episodios: parsearFeed(new TextDecoder('utf-8').decode(buf)) };
  } finally {
    clearTimeout(timer);
  }
}
