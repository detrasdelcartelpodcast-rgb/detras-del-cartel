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

// Pedido con tiempo máximo, tamaño máximo y sin redirecciones. Devuelve el texto de la respuesta.
async function pedir(fetchFn, url, headers = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetchFn(url, { signal: ctl.signal, redirect: 'error', headers: { 'User-Agent': 'DetrasDelCartel-Web/1.0', ...headers } });
    if (!r.ok) {
      const e = new Error(`YouTube respondió ${r.status}`); // mensaje sin la URL: la clave nunca sale en un error
      e.status = r.status;
      throw e;
    }
    const buf = await r.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error('respuesta demasiado grande');
    return new TextDecoder('utf-8').decode(buf);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- Vía 1 (principal): API oficial YouTube Data API v3
// Necesita la variable YOUTUBE_API_KEY (solo en Vercel). Se envía por HEADER (x-goog-api-key), no por la URL,
// para que no quede en registros. Trae SOLO videos públicos e insertables, con su duración.
const CLAVE_OK = /^[A-Za-z0-9_-]{30,60}$/;

export function duracionSegundos(iso) {
  const m = /^P(?:(\d{1,3})D)?(?:T(?:(\d{1,3})H)?(?:(\d{1,3})M)?(?:(\d{1,3})S)?)?$/.exec(String(iso || ''));
  if (!m) return null;
  const [, d = 0, h = 0, mi = 0, s = 0] = m;
  return Number(d) * 86400 + Number(h) * 3600 + Number(mi) * 60 + Number(s);
}

export function parsearApi(subidas, videos) {
  const items = Array.isArray(videos && videos.items) ? videos.items : [];
  const orden = new Map(); // videoId -> posición en la lista de subidas
  (Array.isArray(subidas && subidas.items) ? subidas.items : []).forEach((it, i) => {
    const vid = it && it.contentDetails && it.contentDetails.videoId;
    if (typeof vid === 'string') orden.set(vid, i);
  });
  const episodios = [];
  for (const v of items) {
    if (!v || typeof v !== 'object') continue;
    const id = typeof v.id === 'string' ? v.id.trim() : '';
    if (!/^[A-Za-z0-9_-]{11}$/.test(id) || !orden.has(id)) continue;
    const st = v.status || {};
    if (st.privacyStatus !== 'public' || st.embeddable !== true) continue; // privado / no listado / no insertable → no se muestra
    const sn = v.snippet || {};
    const titulo = limpiar(typeof sn.title === 'string' ? sn.title : '', 160);
    const t = Date.parse(sn.publishedAt);
    if (!titulo || Number.isNaN(t)) continue;
    episodios.push({
      id,
      titulo,
      fecha: new Date(t).toISOString(),
      resumen: resumir(typeof sn.description === 'string' ? sn.description : ''),
      duracion: duracionSegundos(v.contentDetails && v.contentDetails.duration),
    });
  }
  episodios.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  return episodios.slice(0, MAX_EPISODIOS);
}

async function episodiosPorApi(canal, clave, fetchFn) {
  const cab = { 'x-goog-api-key': clave, Accept: 'application/json' };
  const lista = 'UU' + canal.slice(2); // lista de "subidas" del canal
  const base = 'https://www.googleapis.com/youtube/v3';
  let subidas;
  try {
    subidas = JSON.parse(await pedir(fetchFn, `${base}/playlistItems?part=contentDetails&playlistId=${lista}&maxResults=${MAX_EPISODIOS}`, cab));
  } catch (e) {
    // Un canal SIN videos públicos no tiene lista de subidas: la API contesta 404 (playlistNotFound). No es una falla: es "lista vacía".
    if (e && e.status === 404) return [];
    throw e;
  }
  const ids = (Array.isArray(subidas.items) ? subidas.items : [])
    .map((it) => it && it.contentDetails && it.contentDetails.videoId)
    .filter((x) => typeof x === 'string' && /^[A-Za-z0-9_-]{11}$/.test(x));
  if (ids.length === 0) return [];
  const videos = JSON.parse(await pedir(fetchFn, `${base}/videos?part=snippet,contentDetails,status&id=${ids.join(',')}&maxResults=${MAX_EPISODIOS}`, cab));
  return parsearApi(subidas, videos);
}

// ---------------------------------------------------------------- Vía 2 (respaldo): feed público (hoy YouTube lo devuelve 404 seguido)
async function episodiosPorFeed(canal, fetchFn) {
  const xml = await pedir(fetchFn, `https://www.youtube.com/feeds/videos.xml?channel_id=${canal}`);
  return parsearFeed(xml);
}

export async function obtenerEpisodios(env = process.env, fetchFn = fetch) {
  const canal = canalId(env);
  const clave = String(env.YOUTUBE_API_KEY || '').trim();
  if (CLAVE_OK.test(clave)) {
    try {
      return { ok: true, episodios: await episodiosPorApi(canal, clave, fetchFn) };
    } catch {
      /* la API falló (cuota, red, clave revocada): se intenta el respaldo */
    }
  }
  return { ok: true, episodios: await episodiosPorFeed(canal, fetchFn) };
}
