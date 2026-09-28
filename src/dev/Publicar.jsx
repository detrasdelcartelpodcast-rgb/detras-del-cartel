import React, { useState } from 'react';
import { Rocket, Check, AlertTriangle, Loader2 } from 'lucide-react';

/* ==========================================================================
   PUBLICAR — SOLO DESARROLLO (localhost)

   Un botón, un clic, sin preguntas. Lo que Vic ve es: gira → verde (o rojo
   con el motivo, si algo falló).

   El mensaje del commit y la constancia de que se corrió /security-review NO
   se los pide a Vic: los deja escritos Claude en `.deploy-siguiente.json` al
   terminar cada trabajo. Si falta esa constancia, el botón no publica.

   Habla con tools/vite-plugin-publicar.js, que no existe en el sitio
   compilado: nada de esto viaja a Vercel.
========================================================================== */

const TOKEN = typeof window !== 'undefined' ? window.__TOKEN_PUBLICAR__ ?? '' : '';

export default function Publicar() {
  const [estado, setEstado] = useState('listo'); // listo · publicando · ok · error
  const [motivo, setMotivo] = useState('');

  async function publicar() {
    if (estado === 'publicando') return;
    setEstado('publicando');
    setMotivo('');
    try {
      const r = await fetch('/__publicar/ejecutar', {
        method: 'POST',
        headers: { 'x-publicar-token': TOKEN, 'Content-Type': 'application/json' },
        body: '{}',
      });
      const resultado = await r.json();
      if (resultado.ok) {
        setEstado('ok');
        setTimeout(() => setEstado('listo'), 8000);
      } else {
        const fallo = resultado.pasos?.find((p) => !p.ok);
        setEstado('error');
        setMotivo(fallo ? `${fallo.titulo}: ${fallo.detalle}`.slice(0, 300) : resultado.error || 'No se pudo publicar.');
      }
    } catch (e) {
      setEstado('error');
      setMotivo(String(e.message || e));
    }
  }

  const color = {
    listo: 'text-gray-400 hover:text-white hover:bg-gray-700',
    publicando: 'bg-amber-500 text-white',
    ok: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
  }[estado];

  const titulo = {
    listo: 'Publicar el sitio',
    publicando: 'Publicando…',
    ok: 'Publicado y verificado en vivo',
    error: motivo,
  }[estado];

  return (
    <>
      <button onClick={publicar} title={titulo} className={`p-2 rounded-xl transition ${color}`}>
        {estado === 'publicando' && <Loader2 size={18} className="animate-spin" />}
        {estado === 'ok' && <Check size={18} />}
        {estado === 'error' && <AlertTriangle size={18} />}
        {estado === 'listo' && <Rocket size={18} />}
      </button>

      {/* Solo aparece si algo salió mal: es lo único que Vic necesita leer. */}
      {estado === 'error' && (
        <div className="fixed inset-x-3 bottom-24 md:inset-x-auto md:right-6 md:w-[380px] z-[10000] bg-red-950 border border-red-700 rounded-2xl shadow-2xl p-3.5 text-white">
          <p className="text-xs font-bold text-red-300 mb-1">No se publicó</p>
          <pre className="text-[11px] whitespace-pre-wrap break-words font-mono text-red-100/90">{motivo}</pre>
          <button onClick={() => setEstado('listo')} className="mt-2 text-[11px] text-red-300 underline">
            Entendido
          </button>
        </div>
      )}
    </>
  );
}
