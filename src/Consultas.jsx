import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Star, Trash2, RotateCcw, Download, LogOut, Loader2, MessageSquare, Phone, Mail, Send, AlarmClock, Lock } from 'lucide-react';
import { supabase, hayConfiguracion, entrarConGoogle, salir } from './lib/supabase';
import { descargarExcel } from './lib/excel';
import ThemeToggle from './ThemeToggle';

/* ==========================================================================
   /consultas — EL BUZÓN

   Pantalla privada. Quien la abra ve un botón de entrar. Si entra con una
   cuenta que NO está en la tabla `autorizados`, se le dice claramente que esa
   cuenta no tiene acceso: antes veía el buzón vacío y parecía que no había
   consultas (Vic, 27-09). La comprobación se le hace a la BASE, no a una lista
   escrita en el navegador, y aunque alguien la saltee no hay nada que ver: RLS
   no le entrega ninguna fila.

   NO se indexa (ver el efecto de más abajo, public/robots.txt y vercel.json).
========================================================================== */

const ETIQUETAS = ['Precio', 'Comisiones', 'Herencia', 'Divorcio', 'Papeles', 'Inversión', 'Alquiler', 'Publicación'];

const PASOS = [
  { id: 'contestar_mail', texto: 'Contestar por mail' },
  { id: 'llamar_whatsapp', texto: 'Llamar / WhatsApp' },
  { id: 'desarrollar_episodio', texto: 'Desarrollar episodio' },
  { id: 'esperando_respuesta', texto: 'Esperando respuesta de él' },
];

const DESENLACES = [
  { id: 'episodio', texto: 'Salió en el episodio' },
  { id: 'respondida', texto: 'Respondida' },
  { id: 'descartada', texto: 'Descartada' },
  { id: 'duplicada', texto: 'Duplicada de otra' },
];

const ROTULO = { programa: 'PARA EL PROGRAMA', privado: 'PIDE RESPUESTA', anonimo: 'ANÓNIMA' };
const COLOR_TIPO = {
  programa: 'bg-sky-400/15 text-sky-400',
  privado: 'bg-red-400/15 text-red-400',
  anonimo: 'bg-slate-400/15 text-slate-400',
};

const num = (id) => '#' + String(id).padStart(4, '0');
const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const chip = (activo) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
    activo ? 'bg-accent/15 border-accent text-accent' : 'bg-card2 border-line/10 text-soft hover:border-accent/40'
  }`;

const controlito = 'bg-input text-fg border border-line/10 rounded-lg px-2.5 py-1.5 text-xs';

export default function Consultas() {
  const [sesion, setSesion] = useState(undefined); // undefined = averiguando
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [etiqueta, setEtiqueta] = useState(null);
  const [busca, setBusca] = useState('');
  const [abierta, setAbierta] = useState(null);
  const [elegidas, setElegidas] = useState(() => new Set());
  const [periodo, setPeriodo] = useState('todo');
  const [notas, setNotas] = useState({}); // { consulta_id: [anotaciones] }

  // Esta pantalla no se indexa nunca, ni cuando el resto del sitio se abra a Google.
  useEffect(() => {
    document.title = 'Buzón de consultas · Detrás del Cartel';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!hayConfiguracion) return setSesion(null);
    supabase.auth.getSession().then(({ data }) => setSesion(data.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // Entrar con Google no alcanza: la dirección tiene que estar en `autorizados`.
  // Se le pregunta a la BASE (no a una lista escrita en el navegador): si no está,
  // la consulta devuelve cero filas y se muestra "esta cuenta no tiene acceso".
  // Antes, una cuenta ajena veía el buzón vacío y parecía que no había consultas.
  const [autorizado, setAutorizado] = useState(null); // null = averiguando

  useEffect(() => {
    if (!sesion) return setAutorizado(null);
    supabase
      .from('autorizados')
      .select('email')
      .limit(1)
      .then(({ data }) => setAutorizado((data ?? []).length > 0));
  }, [sesion]);

  const traer = useCallback(async () => {
    setCargando(true);
    const [{ data, error }, { data: anotaciones }] = await Promise.all([
      supabase.from('consultas').select('*').order('creado_en', { ascending: false }),
      supabase.from('consulta_notas').select('*').order('creado_en', { ascending: true }),
    ]);
    if (error) setError(error.message);
    setConsultas(data ?? []);
    // Agrupa las anotaciones por consulta para no consultar la base una vez por fila.
    const porConsulta = {};
    (anotaciones ?? []).forEach((n) => (porConsulta[n.consulta_id] = [...(porConsulta[n.consulta_id] || []), n]));
    setNotas(porConsulta);
    setCargando(false);
  }, []);

  async function anotar(consultaId, texto) {
    const { data, error } = await supabase
      .from('consulta_notas')
      .insert({ consulta_id: consultaId, texto, autor: sesion.user.email })
      .select()
      .single();
    if (error) return setError('No se pudo anotar: ' + error.message);
    setNotas((n) => ({ ...n, [consultaId]: [...(n[consultaId] || []), data] }));
    // Anotar algo significa que la consulta está en movimiento.
    if (consultas.find((c) => c.id === consultaId)?.situacion === 'nueva') {
      guardar(consultaId, { situacion: 'en_curso' });
    }
  }

  useEffect(() => {
    if (sesion && autorizado) traer();
  }, [sesion, autorizado, traer]);

  async function guardar(id, cambios) {
    setConsultas((cs) => cs.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
    const { error } = await supabase.from('consultas').update(cambios).eq('id', id);
    if (error) {
      setError('No se pudo guardar: ' + error.message);
      traer();
    }
  }

  const vivas = useMemo(() => consultas.filter((c) => !c.borrada), [consultas]);
  const enPapelera = filtro === 'papelera';

  const cuenta = useMemo(() => {
    const t = {};
    vivas.forEach((c) => (c.etiquetas || []).forEach((e) => (t[e] = (t[e] || 0) + 1)));
    return t;
  }, [vivas]);

  // "Vencida": me comprometí a hacer algo para una fecha que ya pasó y sigue abierta.
  const hoy = new Date().toISOString().slice(0, 10);
  const estaVencida = (c) => c.recordar_el && c.recordar_el <= hoy && c.situacion !== 'cerrada' && !c.borrada;

  const visibles = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    const desde = { '7dias': 7, '30dias': 30 }[periodo];
    const corte = desde ? Date.now() - desde * 86400000 : null;

    return consultas.filter((c) => {
      if (Boolean(c.borrada) !== enPapelera) return false;
      if (corte && new Date(c.creado_en).getTime() < corte) return false;
      if (filtro === 'prioritarias' && !c.prioritaria) return false;
      if (filtro === 'vencidas' && !estaVencida(c)) return false;
      if (filtro === 'pendientes' && (c.situacion === 'cerrada' || !c.proximo_paso)) return false;
      if (filtro === 'cerradas' && c.situacion !== 'cerrada') return false;
      if (['programa', 'privado', 'anonimo'].includes(filtro) && c.tipo !== filtro) return false;
      if (filtro !== 'cerradas' && !enPapelera && c.situacion === 'cerrada') return false;
      if (etiqueta && !(c.etiquetas || []).includes(etiqueta)) return false;
      if (!texto) return true;
      const anotaciones = (notas[c.id] || []).map((n) => n.texto).join(' ');
      return [c.tema, c.detalle, c.nombre, c.zona, anotaciones].join(' ').toLowerCase().includes(texto);
    });
  }, [consultas, filtro, etiqueta, busca, enPapelera, periodo, notas, hoy]);

  const temaTop = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
  const esperando = vivas.filter((c) => c.tipo === 'privado' && c.situacion !== 'cerrada').length;
  const vencidas = vivas.filter(estaVencida).length;

  function alternarElegida(id) {
    setElegidas((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function moverPapelera() {
    const afectadas = consultas.filter((c) => elegidas.has(c.id));
    const detalle = afectadas.map((c) => `${num(c.id)} — ${c.tema}`).join('\n');
    const pregunta = enPapelera
      ? `¿Traer de vuelta ${afectadas.length === 1 ? 'esta consulta' : 'estas consultas'}?\n\n${detalle}`
      : `Se van a la papelera (no se borran: se pueden recuperar):\n\n${detalle}`;
    if (!window.confirm(pregunta)) return;
    await Promise.all(afectadas.map((c) => guardar(c.id, { borrada: !enPapelera })));
    setElegidas(new Set());
  }

  function exportar() {
    descargarExcel({
      nombreArchivo: `consultas-detras-del-cartel-${new Date().toISOString().slice(0, 10)}.xlsx`,
      columnas: [
        ['Nº', 8], ['Fecha y hora', 17], ['Tipo', 17], ['Situación', 13], ['Prioritaria', 11],
        ['Temas', 22], ['Próximo paso', 22], ['Recordar', 12], ['Cómo terminó', 18],
        ['Consulta', 46], ['Detalle', 60], ['Nombre', 16], ['Mail', 24], ['Teléfono', 18],
        ['Zona', 16], ['Permiso', 16], ['Anotaciones', 60],
      ],
      filas: vivas.map((c) => [
        num(c.id), fechaHora(c.creado_en), ROTULO[c.tipo], c.situacion, c.prioritaria ? 'Sí' : '',
        (c.etiquetas || []).join(', '),
        PASOS.find((p) => p.id === c.proximo_paso)?.texto || '', c.recordar_el || '',
        DESENLACES.find((d) => d.id === c.desenlace)?.texto || '',
        c.tema, c.detalle, c.nombre, c.email, c.telefono, c.zona,
        c.tipo === 'privado' ? 'no corresponde' : c.permiso_uso ? 'sí, sin nombre' : 'no',
        (notas[c.id] || []).map((n) => `${fechaHora(n.creado_en)} · ${n.autor}: ${n.texto}`).join('\n'),
      ]),
    });
  }

  /* ── Pantallas ─────────────────────────────────────────────────────────── */

  if (!hayConfiguracion) {
    return (
      <Marco>
        <p className="text-sm text-muted">Falta configurar Supabase (revisá el archivo <code>.env.local</code>).</p>
      </Marco>
    );
  }

  if (sesion === undefined) {
    return (
      <Marco>
        <Loader2 className="animate-spin text-accent mx-auto" />
      </Marco>
    );
  }

  if (!sesion) {
    return (
      <Marco>
        <div className="text-center space-y-4">
          <MessageSquare className="w-8 h-8 text-accent mx-auto" />
          <div>
            <h1 className="text-lg font-black text-fg">Buzón de consultas</h1>
            <p className="text-xs text-muted mt-1">Detrás del Cartel</p>
          </div>
          <button
            onClick={entrarConGoogle}
            className="inline-flex items-center gap-2.5 bg-white text-[#1f2937] border border-[#dadce0] rounded-xl px-5 py-3 text-sm font-semibold hover:brightness-95 transition"
          >
            <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Entrar con Google
          </button>
          <p className="text-[11.5px] text-muted leading-relaxed">
            Solo entran las direcciones autorizadas.
            <br />
            Si entrás con otra cuenta, la lista te va a aparecer vacía.
          </p>
        </div>
      </Marco>
    );
  }

  if (autorizado === null) {
    return (
      <Marco>
        <Loader2 className="animate-spin text-accent mx-auto" />
      </Marco>
    );
  }

  if (autorizado === false) {
    return (
      <Marco>
        <div className="text-center space-y-4">
          <div className="w-11 h-11 rounded-full bg-red-500/15 text-red-400 grid place-items-center mx-auto">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-fg">Esta cuenta no tiene acceso</h1>
            <p className="text-[12.5px] text-muted mt-2 leading-relaxed">
              Entraste con <b className="text-soft">{sesion.user.email}</b>, que no está habilitada para ver el buzón.
            </p>
          </div>
          <button
            onClick={salir}
            className="inline-flex items-center gap-2 bg-card2 border border-line/10 rounded-xl px-4 py-2.5 text-xs font-semibold hover:border-accent/40 transition"
          >
            <LogOut size={13} /> Salir y probar con otra cuenta
          </button>
        </div>
      </Marco>
    );
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-9">
        <header className="flex flex-wrap gap-3 items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-black">Buzón de consultas</h1>
            <p className="text-[11.5px] text-muted mt-0.5">
              {sesion.user.email} ·{' '}
              <button onClick={salir} className="text-accent hover:underline inline-flex items-center gap-1">
                <LogOut size={11} /> salir
              </button>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={exportar} className="inline-flex items-center gap-1.5 bg-card2 border border-line/10 rounded-xl px-3.5 py-2 text-xs font-semibold hover:border-accent/40 transition">
              <Download size={14} /> Exportar a Excel
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
          <Ficha valor={esperando} texto="Esperando respuesta" alerta />
          <Ficha valor={vivas.filter((c) => c.situacion === 'nueva').length} texto="Sin abrir" />
          <Ficha valor={temaTop ? `${temaTop[0]} (${temaTop[1]})` : '—'} texto="Tema más pedido" chico />
          <Ficha valor={vivas.length} texto="Recibidas en total" />
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-3">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por tema, nombre o texto…"
            className="flex-1 min-w-[200px] bg-input text-fg border border-line/10 rounded-xl px-3 py-2 text-[13px] placeholder:text-faint focus:outline-none focus:border-accent"
          />
          {[
            ['todas', 'Todas'], ['vencidas', '⏰ Vencidas'], ['privado', 'Piden respuesta'],
            ['programa', 'Para el programa'], ['anonimo', 'Anónimas'], ['prioritarias', '★ Prioritarias'],
            ['pendientes', 'Con algo pendiente'], ['cerradas', 'Cerradas'], ['papelera', '🗑 Papelera'],
          ].map(([id, texto]) => (
            <button key={id} onClick={() => { setFiltro(id); setElegidas(new Set()); }} className={chip(filtro === id)}>
              {texto}
              {id === 'vencidas' && vencidas > 0 && <b className="opacity-60"> {vencidas}</b>}
              {id === 'papelera' && consultas.length - vivas.length > 0 && <b className="opacity-60"> {consultas.length - vivas.length}</b>}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-[11px] text-muted font-semibold">CUÁNDO LLEGÓ:</span>
          {[['7dias', 'Últimos 7 días'], ['30dias', 'Último mes'], ['todo', 'Todo']].map(([id, texto]) => (
            <button key={id} onClick={() => setPeriodo(id)} className={chip(periodo === id)}>{texto}</button>
          ))}
        </div>

        {Object.keys(cuenta).length > 0 && (
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className="text-[11px] text-muted font-semibold">TEMAS:</span>
            {Object.entries(cuenta).sort((a, b) => b[1] - a[1]).map(([e, n]) => (
              <button key={e} onClick={() => setEtiqueta(etiqueta === e ? null : e)} className={chip(etiqueta === e)}>
                {e} <b className="opacity-60">{n}</b>
              </button>
            ))}
          </div>
        )}

        {elegidas.size > 0 && (
          <div className="flex flex-wrap gap-3 items-center justify-between bg-accent/10 border border-accent/35 rounded-xl px-4 py-2.5 mb-3 text-[12.5px] font-semibold">
            <span>{elegidas.size} {elegidas.size === 1 ? 'consulta elegida' : 'consultas elegidas'}</span>
            <div className="flex gap-2">
              <button onClick={() => setElegidas(new Set())} className={chip(false)}>Quitar la selección</button>
              <button onClick={moverPapelera} className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-red-500/15 border-red-500/50 text-red-400">
                {enPapelera ? <><RotateCcw size={12} className="inline mr-1" />Restaurar las elegidas</> : <><Trash2 size={12} className="inline mr-1" />Mandar a la papelera</>}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        {cargando && <Loader2 className="animate-spin text-accent" />}

        {!cargando && visibles.length === 0 && (
          <p className="text-[13px] text-muted py-6">
            {consultas.length === 0
              ? 'Todavía no llegó ninguna consulta. Cuando alguien escriba desde la web, aparece acá.'
              : 'No hay consultas con ese filtro.'}
          </p>
        )}

        <div className="space-y-2.5">
          {visibles.map((c) => (
            <Fila
              key={c.id}
              c={c}
              abierta={abierta === c.id}
              elegida={elegidas.has(c.id)}
              onAbrir={() => setAbierta(abierta === c.id ? null : c.id)}
              onElegir={() => alternarElegida(c.id)}
              onGuardar={(cambios) => guardar(c.id, cambios)}
              anotaciones={notas[c.id] || []}
              onAnotar={(texto) => anotar(c.id, texto)}
              vencida={estaVencida(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Piezas ─────────────────────────────────────────────────────────────── */

function Marco({ children }) {
  return (
    <div className="min-h-screen bg-page text-fg grid place-items-center px-4">
      <div className="bg-card border border-line/8 rounded-3xl p-8 w-full max-w-sm shadow-2xl">{children}</div>
    </div>
  );
}

function Ficha({ valor, texto, alerta, chico }) {
  return (
    <div className={`bg-card border rounded-2xl px-4 py-3 ${alerta && valor > 0 ? 'border-red-500/50' : 'border-line/8'}`}>
      <p className={`font-black leading-none ${chico ? 'text-[17px] pt-1' : 'text-2xl'} ${alerta && valor > 0 ? 'text-red-400' : 'text-fg'}`}>{valor}</p>
      <p className="text-[10.5px] text-muted mt-1.5 uppercase tracking-wide">{texto}</p>
    </div>
  );
}

function Fila({ c, abierta, elegida, onAbrir, onElegir, onGuardar, anotaciones, onAnotar, vencida }) {
  const sinResponder = c.tipo === 'privado' && c.situacion !== 'cerrada';
  const etiquetas = c.etiquetas || [];
  const ultima = anotaciones[anotaciones.length - 1];
  const quien =
    c.tipo === 'anonimo'
      ? 'Anónima · no se guardó ningún dato'
      : [c.nombre || 'Sin nombre', c.email, c.telefono, c.zona].filter(Boolean).join(' · ');

  return (
    <div
      onClick={onAbrir}
      className={`bg-card border rounded-2xl px-4 py-3 cursor-pointer transition ${
        elegida ? 'border-accent bg-accent/5' : 'border-line/8 hover:border-accent/40'
      } ${sinResponder ? 'border-l-[3px] border-l-red-400' : ''} ${c.borrada ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-wrap gap-2 items-center text-[11.5px] text-muted">
        <input
          type="checkbox"
          checked={elegida}
          onClick={(e) => { e.stopPropagation(); onElegir(); }}
          onChange={() => {}}
          className="w-4 h-4 accent-amber-500 shrink-0 cursor-pointer"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onGuardar({ prioritaria: !c.prioritaria }); }}
          title="Prioritaria"
          className={c.prioritaria ? 'text-accent' : 'text-faint hover:text-accent'}
        >
          <Star size={14} fill={c.prioritaria ? 'currentColor' : 'none'} />
        </button>
        <span className="font-mono text-accent font-bold">{num(c.id)}</span>
        <span>{fechaHora(c.creado_en)} h</span>
        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${COLOR_TIPO[c.tipo]}`}>{ROTULO[c.tipo]}</span>
        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-line/7 text-soft">
          {c.situacion === 'nueva' ? 'Nueva' : c.situacion === 'en_curso' ? 'En curso' : 'Cerrada'}
        </span>
        {etiquetas.map((e) => (
          <span key={e} className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-line/8 text-soft">{e}</span>
        ))}
        {c.proximo_paso && c.situacion !== 'cerrada' && (
          <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${vencida ? 'bg-red-400/15 text-red-400' : 'bg-accent/14 text-accent'}`}>
            {vencida && <AlarmClock size={10} className="inline mr-1 -mt-0.5" />}
            → {PASOS.find((p) => p.id === c.proximo_paso)?.texto}
            {c.recordar_el && ` · ${c.recordar_el}`}
          </span>
        )}
      </div>

      <p className="text-[14px] font-semibold text-fg mt-2 leading-snug">{c.tema}</p>
      <p className="text-[12px] text-muted mt-1">{quien}</p>
      {ultima && !abierta && (
        <p className="text-[12px] text-muted italic mt-1 truncate">✎ {ultima.texto}</p>
      )}

      {abierta && <Detalle c={c} onGuardar={onGuardar} etiquetas={etiquetas} anotaciones={anotaciones} onAnotar={onAnotar} />}
    </div>
  );
}

function Bitacora({ anotaciones, onAnotar }) {
  const [texto, setTexto] = useState('');
  const [anotando, setAnotando] = useState(false);

  async function enviar() {
    const limpio = texto.trim();
    if (!limpio) return;
    setAnotando(true);
    await onAnotar(limpio);
    setTexto('');
    setAnotando(false);
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted font-semibold">ANOTACIONES</p>

      {anotaciones.length > 0 && (
        <ul className="space-y-2 border-l-2 border-line/10 pl-3">
          {anotaciones.map((n) => (
            <li key={n.id}>
              <p className="text-[10.5px] text-faint font-mono">
                {fechaHora(n.creado_en)} · {n.autor === 'migrado' ? 'anotación anterior' : n.autor?.split('@')[0]}
              </p>
              <p className="text-[12.5px] text-soft leading-relaxed whitespace-pre-wrap">{n.texto}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 items-start">
        <textarea
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            // Enter manda; Mayúsculas+Enter hace un renglón nuevo.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          placeholder="Escribí qué pasó: le contesté, me llamó, quedamos en…"
          className="flex-1 bg-input text-fg border border-line/10 rounded-lg px-2.5 py-2 text-xs resize-y placeholder:text-faint focus:outline-none focus:border-accent"
        />
        <button
          onClick={enviar}
          disabled={anotando || !texto.trim()}
          className="bg-accent text-[#10131a] rounded-lg px-3.5 py-2 text-xs font-bold shrink-0 disabled:opacity-40 inline-flex items-center gap-1.5"
        >
          {anotando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Anotar
        </button>
      </div>
    </div>
  );
}

function Detalle({ c, onGuardar, etiquetas, anotaciones, onAnotar }) {
  const cerrada = c.situacion === 'cerrada';

  function alternarEtiqueta(e) {
    const nuevas = etiquetas.includes(e) ? etiquetas.filter((x) => x !== e) : [...etiquetas, e];
    onGuardar({ etiquetas: nuevas });
  }

  function cambiarSituacion(situacion) {
    // Al cerrar hace falta decir cómo terminó; al reabrir se limpia el desenlace.
    if (situacion === 'cerrada') return onGuardar({ situacion, desenlace: 'respondida', proximo_paso: null, recordar_el: null });
    onGuardar({ situacion, desenlace: null, episodio: null, duplicada_de: null });
  }

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-line/15 space-y-3" onClick={(e) => e.stopPropagation()}>
      {c.detalle && <p className="text-[13px] text-soft leading-relaxed whitespace-pre-wrap">{c.detalle}</p>}

      <p className="text-[12px] text-muted">
        <b className="text-fg">Permiso para contarlo:</b>{' '}
        {c.tipo === 'privado' ? 'no corresponde (es privada)' : c.permiso_uso ? 'sí, sin nombre' : 'no'}
      </p>

      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-muted font-semibold mr-1">Temas</span>
        {ETIQUETAS.map((e) => (
          <button key={e} onClick={() => alternarEtiqueta(e)} className={chip(etiquetas.includes(e))}>{e}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-muted font-semibold">Situación</span>
        <select value={c.situacion} onChange={(e) => cambiarSituacion(e.target.value)} className={controlito}>
          <option value="nueva">Nueva</option>
          <option value="en_curso">En curso</option>
          <option value="cerrada">Cerrada</option>
        </select>

        {!cerrada && (
          <>
            <span className="text-[11px] text-muted font-semibold">Próximo paso</span>
            <select value={c.proximo_paso || ''} onChange={(e) => onGuardar({ proximo_paso: e.target.value || null })} className={controlito}>
              <option value="">Sin definir</option>
              {PASOS.map((p) => <option key={p.id} value={p.id}>{p.texto}</option>)}
            </select>
            <span className="text-[11px] text-muted font-semibold">Recordar el</span>
            <input type="date" value={c.recordar_el || ''} onChange={(e) => onGuardar({ recordar_el: e.target.value || null })} className={controlito} />
          </>
        )}

        {cerrada && (
          <>
            <span className="text-[11px] text-muted font-semibold">Cómo terminó</span>
            <select value={c.desenlace || 'respondida'} onChange={(e) => onGuardar({ desenlace: e.target.value })} className={controlito}>
              {DESENLACES.map((d) => <option key={d.id} value={d.id}>{d.texto}</option>)}
            </select>
            {c.desenlace === 'episodio' && (
              <input type="number" min="1" placeholder="Nº" value={c.episodio || ''} onChange={(e) => onGuardar({ episodio: Number(e.target.value) || null })} className={`${controlito} w-20`} />
            )}
            {c.desenlace === 'duplicada' && (
              <input type="number" min="1" placeholder="Nº de la original" value={c.duplicada_de || ''} onChange={(e) => onGuardar({ duplicada_de: Number(e.target.value) || null })} className={`${controlito} w-36`} />
            )}
          </>
        )}
      </div>

      <Bitacora anotaciones={anotaciones} onAnotar={onAnotar} />

      {(c.email || c.telefono) && (
        <div className="flex flex-wrap gap-2">
          {c.telefono && (
            <a
              href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-card2 border border-line/10 rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-accent/40"
            >
              <Phone size={13} /> Abrir WhatsApp
            </a>
          )}
          {c.email && (
            <a
              // La dirección se corta en el primer "?" y se codifica: aunque una
              // dirección rara llegue a guardarse, no puede meter una copia oculta
              // ni un texto propio en el mensaje que escribimos.
              href={`mailto:${encodeURIComponent(String(c.email).split('?')[0])}?subject=${encodeURIComponent('Detrás del Cartel — tu consulta ' + num(c.id))}`}
              className="inline-flex items-center gap-1.5 bg-card2 border border-line/10 rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-accent/40"
            >
              <Mail size={13} /> Responder por mail
            </a>
          )}
        </div>
      )}
    </div>
  );
}
