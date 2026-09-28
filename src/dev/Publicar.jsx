import React, { useEffect, useState } from 'react';
import { Rocket, X, Check, AlertTriangle, Loader2 } from 'lucide-react';

/* ==========================================================================
   PUBLICAR — SOLO DESARROLLO (localhost)
   Botón de la barra flotante + panel con lo que se va a publicar.
   Habla con el plugin tools/vite-plugin-publicar.js, que NO existe en el
   sitio compilado: nada de esto viaja a Vercel.
========================================================================== */

// Lo inyecta el plugin en la página, solo mientras corre el servidor de desarrollo.
const TOKEN = typeof window !== 'undefined' ? window.__TOKEN_PUBLICAR__ ?? '' : '';

async function pedir(ruta, cuerpo) {
  const r = await fetch(`/__publicar/${ruta}`, {
    method: cuerpo ? 'POST' : 'GET',
    headers: { 'x-publicar-token': TOKEN, ...(cuerpo ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return r.json();
}

function Paso({ paso }) {
  return (
    <li className="flex gap-2 items-start text-[11px] leading-snug">
      {paso.ok ? (
        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p className={paso.ok ? 'text-gray-200' : 'text-red-300 font-semibold'}>{paso.titulo}</p>
        {paso.detalle && <pre className="text-gray-400 whitespace-pre-wrap break-words font-mono text-[10px] mt-0.5">{paso.detalle}</pre>}
      </div>
    </li>
  );
}

export default function Publicar() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [revisado, setRevisado] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!abierto) return;
    setResultado(null);
    pedir('estado').then(setEstado).catch(() => setEstado({ ok: false }));
  }, [abierto]);

  const publicar = async () => {
    setPublicando(true);
    setResultado(null);
    try {
      setResultado(await pedir('ejecutar', { mensaje, revisionHecha: revisado }));
    } catch (e) {
      setResultado({ ok: false, pasos: [{ titulo: 'Error de conexión', ok: false, detalle: String(e) }] });
    }
    setPublicando(false);
    pedir('estado').then(setEstado).catch(() => {});
  };

  const hayCambios = estado?.cambios?.length > 0;
  const listo = estado?.hayAlgo && estado?.ramaCorrecta && revisado && (!hayCambios || mensaje.trim().length >= 8);

  return (
    <>
      <button
        onClick={() => setAbierto(!abierto)}
        className={`p-2 rounded-xl transition ${abierto ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Publicar el sitio"
      >
        <Rocket size={18} />
      </button>

      {abierto && (
        <div className="fixed inset-x-3 bottom-24 md:inset-x-auto md:right-6 md:w-[420px] max-h-[70vh] overflow-auto z-[10000] bg-gray-900/98 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-4 text-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2"><Rocket size={16} className="text-emerald-400" /> Publicar el sitio</h2>
            <button onClick={() => setAbierto(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>

          {!estado && <p className="text-xs text-gray-400">Leyendo el estado…</p>}

          {estado && !estado.ok && <p className="text-xs text-red-300">No se pudo leer el estado del repositorio.</p>}

          {estado?.ok && (
            <>
              {!estado.ramaCorrecta && (
                <p className="text-xs text-red-300">Estás en la rama <b>{estado.rama}</b>. Solo se publica desde <b>main</b>.</p>
              )}

              {!estado.hayAlgo ? (
                <p className="text-xs text-gray-300">Producción está al día: no hay nada para publicar.</p>
              ) : (
                <div className="text-[11px] text-gray-300 space-y-1.5">
                  {estado.cambios.length > 0 && (
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-bold">Archivos modificados</p>
                      <ul className="font-mono text-[10px] text-gray-300 mt-0.5 space-y-0.5">
                        {estado.cambios.map((c) => <li key={c} className="truncate">{c}</li>)}
                      </ul>
                    </div>
                  )}
                  {estado.commits.length > 0 && (
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px] font-bold">Commits sin subir</p>
                      <ul className="font-mono text-[10px] text-gray-300 mt-0.5 space-y-0.5">
                        {estado.commits.map((c) => <li key={c} className="truncate">{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {estado.hayAlgo && (
                <>
                  {estado.cambios.length > 0 && (
                    <input
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Qué cambió (queda registrado en el historial)"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-xs placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  )}

                  <label className="flex gap-2 items-start text-[11px] text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={revisado} onChange={(e) => setRevisado(e.target.checked)} className="mt-0.5 accent-emerald-500" />
                    <span>Claude ya corrió <b>/security-review</b> sobre estos cambios. (El botón revisa claves y archivos prohibidos, pero no reemplaza la revisión.)</span>
                  </label>

                  <button
                    onClick={publicar}
                    disabled={!listo || publicando}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      listo && !publicando ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {publicando ? <><Loader2 size={14} className="animate-spin" /> Publicando…</> : <><Rocket size={14} /> Publicar ahora</>}
                  </button>
                  {publicando && <p className="text-[10px] text-gray-500 text-center">Pruebas, compilación, subida y verificación en vivo. Puede tardar unos minutos.</p>}
                </>
              )}
            </>
          )}

          {resultado && (
            <div className="border-t border-gray-700 pt-2.5 space-y-2">
              <p className={`text-xs font-bold ${resultado.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {resultado.ok ? 'Publicado' : 'No se publicó'}
              </p>
              <ul className="space-y-1.5">{resultado.pasos?.map((p, i) => <Paso key={i} paso={p} />)}</ul>
              {resultado.ok && (
                <a href={resultado.web} target="_blank" rel="noreferrer" className="block text-[11px] text-emerald-400 underline">
                  Abrir el sitio publicado
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
