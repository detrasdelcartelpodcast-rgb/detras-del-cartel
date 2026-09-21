import React, { useEffect, useState } from 'react';
import { ChevronRight, Play } from 'lucide-react';

/* ==========================================================================
   EPISODIOS AUTOMÁTICOS (desde el canal de YouTube)
   Los datos llegan de /api/episodios (api/episodios.js), que lee el feed público del canal.
   Subís un video a YouTube y aparece acá solo (hasta ~5 min de demora por la caché).
   - "Último episodio": el video más nuevo, con reproductor.
   - "Episodios anteriores": los siguientes (hasta 6). No se muestra si no hay más.
   - Sin videos (o si YouTube falla): tarjeta "Muy pronto: el primer episodio".
   Opcional: si el título del video empieza con "#5 · ", se muestra "EPISODIO 5".
========================================================================== */

const ID_OK = /^[A-Za-z0-9_-]{11}$/;

// Solo en localhost: /?demo=1 muestra episodios de ejemplo para ver el diseño (NO viaja al sitio publicado).
const DEMO = import.meta.env.DEV
  ? [
      { id: 'demoAAAAAA1', titulo: '#3 · Ejemplo: cómo se decide un precio', fecha: '2026-09-20T12:00:00.000Z', resumen: 'Texto de ejemplo del último episodio. Acá se ven las dos primeras líneas de la descripción del video.' },
      { id: 'demoAAAAAA2', titulo: '#2 · Ejemplo: una herencia y dos opiniones', fecha: '2026-09-06T12:00:00.000Z', resumen: 'Resumen de ejemplo de un episodio anterior.' },
      { id: 'demoAAAAAA3', titulo: '#1 · Ejemplo: por qué da miedo vender', fecha: '2026-08-23T12:00:00.000Z', resumen: 'Resumen de ejemplo del primer episodio.' },
    ]
  : [];

export function useEpisodios(habilitado) {
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error
  const [episodios, setEpisodios] = useState([]);

  useEffect(() => {
    if (!habilitado) return undefined;
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')) {
      setEpisodios(DEMO);
      setEstado('ok');
      return undefined;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    fetch('/api/episodios', { signal: ctl.signal, headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        const lista = Array.isArray(d && d.episodios)
          ? d.episodios.filter((e) => e && ID_OK.test(e.id) && typeof e.titulo === 'string')
          : [];
        setEpisodios(lista);
        setEstado('ok');
      })
      .catch(() => setEstado('error'))
      .finally(() => clearTimeout(timer));
    return () => { ctl.abort(); clearTimeout(timer); };
  }, [habilitado]);

  return { estado, episodios };
}

// "#5 · Título" -> { numero: "5", titulo: "Título" }
function separar(titulo) {
  const m = /^#\s*(\d{1,4})\s*[·|:\-–—]\s*(.+)$/.exec(titulo);
  return m ? { numero: m[1], titulo: m[2] } : { numero: null, titulo };
}

function fechaLarga(iso) {
  try {
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(iso));
  } catch {
    return '';
  }
}

// 630 -> "10:30" · 3723 -> "1:02:03" · 10 -> "0:10". Sin dato (vía de respaldo) no se muestra nada.
function duracionTexto(seg) {
  if (!Number.isInteger(seg) || seg < 0 || seg > 86400) return '';
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
  const dos = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${dos(m)}:${dos(s)}` : `${m}:${dos(s)}`;
}

export function UltimoEpisodio({ estado, episodios, activo, canalUrl }) {
  if (estado === 'cargando') {
    return (
      <section id="episodio" aria-busy="true" className="rounded-3xl bg-card2 border border-amber-500/20 p-6 md:p-8 shadow-2xl">
        <div className="aspect-video rounded-2xl bg-line/5 animate-pulse" />
      </section>
    );
  }

  if (!activo) {
    return (
      <section id="episodio" className="rounded-3xl bg-card2 border border-amber-500/20 p-6 md:p-8 text-center space-y-3 shadow-2xl">
        <span className="text-[10px] md:text-xs font-mono text-accent font-bold uppercase tracking-widest block">
          ÚLTIMO EPISODIO
        </span>
        <h2 className="text-xl md:text-2xl font-black text-fg">Muy pronto: el primer episodio</h2>
        <p className="text-xs md:text-sm text-soft max-w-md mx-auto leading-relaxed">
          Lo vas a encontrar acá y en nuestro canal de YouTube apenas esté publicado.
        </p>
        <a href={canalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-[#07090E] font-extrabold text-xs md:text-sm transition active:scale-95">
          <span>Ir al canal de YouTube</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </section>
    );
  }

  const { numero, titulo } = separar(activo.titulo);
  const esUltimo = activo.id === episodios[0].id;
  const etiqueta = `${esUltimo ? 'ÚLTIMO EPISODIO' : 'EPISODIO'}${numero ? ` · Nº ${numero}` : ''}`;

  return (
    <section id="episodio" className="rounded-3xl bg-card2 border border-amber-500/20 p-4 md:p-8 shadow-2xl space-y-4">
      <span className="text-[10px] md:text-xs font-mono text-accent font-bold uppercase tracking-widest block px-1">
        {etiqueta}
      </span>

      <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-line/10">
        <iframe
          key={activo.id}
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${activo.id}?rel=0`}
          title={`Reproductor: ${titulo}`}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      <div className="space-y-2 px-1">
        <h2 className="text-lg md:text-2xl font-black text-fg leading-snug">{titulo}</h2>
        <p className="text-[11px] md:text-xs font-mono text-muted">{fechaLarga(activo.fecha)}{duracionTexto(activo.duracion) ? ` · ${duracionTexto(activo.duracion)}` : ''}</p>
        {activo.resumen && <p className="text-xs md:text-sm text-soft leading-relaxed">{activo.resumen}</p>}
        <a
          href={`https://www.youtube.com/watch?v=${activo.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 pt-1 text-xs md:text-sm font-bold text-accent hover:underline"
        >
          <span>Ver en YouTube</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

export function EpisodiosAnteriores({ episodios, activo, onElegir }) {
  const lista = episodios.filter((e) => !activo || e.id !== activo.id).slice(0, 6);
  if (lista.length === 0) return null; // hasta que haya más de un video, la sección no se muestra

  return (
    <section id="anteriores" className="space-y-4">
      <h2 className="text-xl md:text-2xl font-black text-fg">Episodios anteriores</h2>
      <div className="space-y-3">
        {lista.map((e) => {
          const { numero, titulo } = separar(e.titulo);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onElegir(e.id)}
              className="w-full text-left p-4 md:p-5 rounded-2xl bg-card border border-line/5 hover:border-amber-500/40 transition group space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] md:text-[11px] font-mono">
                <span className="text-accent font-bold uppercase">{numero ? `EPISODIO ${numero}` : 'EPISODIO'}</span>
                <span className="text-muted">{fechaLarga(e.fecha)}{duracionTexto(e.duracion) ? ` · ${duracionTexto(e.duracion)}` : ''}</span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-fg leading-snug">{titulo}</h3>
              {e.resumen && <p className="text-xs text-soft leading-relaxed line-clamp-2">{e.resumen}</p>}
              <span className="inline-flex items-center space-x-1.5 pt-1 text-xs font-bold text-accent">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reproducir</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
