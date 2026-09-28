import React, { useEffect, useRef, useState } from 'react';
import { Send, Check, Loader2, ShieldCheck, ChevronDown } from 'lucide-react';

/* ==========================================================================
   PROPONÉ UN TEMA — formulario que guarda en la base

   Reemplaza al `mailto:` anterior. Lo que se escribe acá va a /api/consulta,
   que es la única que puede escribir en la base (con la clave secreta, del
   lado del servidor).

   Los tres caminos de la primera pregunta cambian lo que se pide:
    · programa → nombre, contacto y zona son opcionales
    · privado  → hace falta mail o WhatsApp (con uno alcanza)
    · anónimo  → no se pide ni se guarda NINGÚN dato que identifique
========================================================================== */

const OPCIONES = [
  { id: 'programa', titulo: 'Háblenlo en el programa', ayuda: 'Entra en la lista de temas que estamos preparando.' },
  { id: 'privado', titulo: 'Prefiero que me contesten a mí', ayuda: 'Te escribimos por mail o WhatsApp. No sale al aire.' },
  { id: 'anonimo', titulo: 'Prefiero no dar mi nombre', ayuda: 'No te pedimos ningún dato. Ni sabemos quién sos.' },
];

const GRACIAS = {
  programa: 'Lo leemos los dos. Si da para un episodio, lo vas a escuchar — contado sin tu nombre. Los temas más repetidos son los que salen primero.',
  privado: 'Te escribimos nosotros por donde nos dejaste. Puede tardar unos días: somos dos y contestamos uno por uno.',
  anonimo: 'No sabemos quién sos y así queda. Lo leemos igual, y si sirve para un episodio lo vamos a contar.',
};

const campo =
  'w-full bg-input text-fg border border-line/10 rounded-xl px-3.5 py-2.5 text-sm placeholder:text-faint focus:outline-none focus:border-accent transition';

export default function Formulario({ config }) {
  // El formulario arranca cerrado: en la landing solo se ve el botón, y se
  // despliega cuando alguien quiere escribir. Abierto todo el tiempo ocupaba
  // media pantalla y empujaba el resto de la página para abajo.
  const [desplegado, setDesplegado] = useState(false);
  const [tipo, setTipo] = useState('programa');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(null);
  const abierto = useRef(Date.now()); // para distinguir a una persona de un robot
  const caja = useRef(null);

  // El botón del pie del celular lleva a #buzon: si alguien llega por ahí,
  // el formulario tiene que abrirse solo, no obligarlo a un clic más.
  useEffect(() => {
    const abrirSiVienenAlBuzon = () => {
      if (window.location.hash === '#buzon') setDesplegado(true);
    };
    abrirSiVienenAlBuzon();
    window.addEventListener('hashchange', abrirSiVienenAlBuzon);
    return () => window.removeEventListener('hashchange', abrirSiVienenAlBuzon);
  }, []);

  function desplegar() {
    setDesplegado(true);
    // Da tiempo a que aparezca para poder llevar la vista al primer campo.
    setTimeout(() => caja.current?.querySelector('input[name="tema"]')?.focus({ preventScroll: true }), 60);
  }

  const anonima = tipo === 'anonimo';
  const privada = tipo === 'privado';

  async function enviar(e) {
    e.preventDefault();
    setError('');
    const datos = Object.fromEntries(new FormData(e.currentTarget));

    if (privada && !datos.email?.trim() && !datos.telefono?.trim()) {
      return setError('Dejanos un mail o un WhatsApp para poder contestarte.');
    }

    setEnviando(true);
    try {
      const r = await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          tema: datos.tema,
          detalle: datos.detalle,
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
          zona: datos.zona,
          permiso_uso: datos.permiso_uso === 'on',
          web: datos.web, // trampa para robots: tiene que llegar vacío
          demora: Date.now() - abierto.current,
        }),
      });
      const respuesta = await r.json();
      if (!r.ok || !respuesta.ok) throw new Error(respuesta.error || 'No pudimos guardarlo.');
      setListo(tipo);
    } catch (e) {
      setError(e.message);
    }
    setEnviando(false);
  }

  if (listo) {
    return (
      <div className="bg-card border border-line/5 rounded-3xl p-7 md:p-9 text-center space-y-3">
        <div className="w-11 h-11 rounded-full bg-accent/15 text-accent grid place-items-center mx-auto">
          <Check size={22} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-fg">Gracias por confiarnos esto.</h3>
        <p className="text-sm text-soft leading-relaxed max-w-md mx-auto">{GRACIAS[listo]}</p>
      </div>
    );
  }

  if (!desplegado) {
    return (
      <div className="space-y-3">
        <button
          onClick={desplegar}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#07090E] font-black text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <span>{config?.button || 'Mandanos tu caso'}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <p className="text-[11px] md:text-xs text-muted leading-relaxed">
          Lo único que hace falta es contarnos el tema. El resto, si querés. Podés escribirnos anónimamente.
        </p>
      </div>
    );
  }

  return (
    <form ref={caja} onSubmit={enviar} className="bg-card border border-line/5 rounded-3xl p-5 md:p-7 space-y-5">
      <fieldset className="space-y-3">
        <legend className="text-[13px] font-bold text-fg mb-3">¿Cómo preferís que lo tratemos?</legend>
        <div className="grid md:grid-cols-3 gap-2.5">
          {OPCIONES.map((o) => (
            <label
              key={o.id}
              className={`block cursor-pointer rounded-2xl border p-3.5 transition text-left ${
                tipo === o.id ? 'border-accent bg-accent/[0.07]' : 'border-line/10 bg-card2 hover:border-accent/50'
              }`}
            >
              <input type="radio" name="tipo" value={o.id} checked={tipo === o.id} onChange={() => setTipo(o.id)} className="sr-only" />
              <span className="flex items-center gap-2 text-[13px] font-bold text-fg">
                <span className={`w-[15px] h-[15px] rounded-full border-2 shrink-0 grid place-items-center ${tipo === o.id ? 'border-accent' : 'border-faint'}`}>
                  {tipo === o.id && <span className="w-[7px] h-[7px] rounded-full bg-accent" />}
                </span>
                {o.titulo}
              </span>
              <span className="block text-[11.5px] text-muted mt-1.5 leading-relaxed">{o.ayuda}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-3.5">
        <div>
          <label htmlFor="tema" className="block text-[12.5px] font-semibold text-fg mb-1.5">
            ¿Qué te está pasando, o qué te gustaría entender?
          </label>
          <input id="tema" name="tema" required maxLength={300} className={campo}
            placeholder="Ej.: heredamos con mis hermanos y no sabemos por dónde empezar" />
        </div>

        <div>
          <label htmlFor="detalle" className="block text-[12.5px] font-semibold text-fg mb-1.5">
            Si querés, contanos un poco más <span className="text-faint font-medium">(opcional)</span>
          </label>
          <textarea id="detalle" name="detalle" rows={4} maxLength={4000} className={`${campo} resize-y`}
            placeholder="Como te salga. Cuanto más nos cuentes, mejor te lo podemos contestar." />
        </div>

        {!anonima && (
          <>
            <div>
              <label htmlFor="nombre" className="block text-[12.5px] font-semibold text-fg mb-1.5">
                Cómo querés que te llamemos <span className="text-faint font-medium">(opcional)</span>
              </label>
              <input id="nombre" name="nombre" maxLength={120} className={campo} placeholder="Tu nombre o un apodo" />
            </div>

            <div>
              <p className="text-[13px] font-bold text-fg mb-2">
                {privada ? '¿Por dónde te contestamos? ' : '¿Querés que te contestemos? '}
                <span className="text-faint font-medium">{privada ? 'Dejanos al menos uno.' : 'Opcional: dejanos mail o WhatsApp.'}</span>
              </p>
              <div className="grid md:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="email" className="block text-[12.5px] font-semibold text-fg mb-1.5">Mail</label>
                  <input id="email" name="email" type="email" maxLength={200} className={campo} placeholder="tunombre@mail.com" />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-[12.5px] font-semibold text-fg mb-1.5">WhatsApp o teléfono</label>
                  <input id="telefono" name="telefono" maxLength={40} className={campo} placeholder="11 5555 5555" />
                </div>
              </div>
              <p className="text-[11.5px] text-muted mt-2 leading-relaxed">
                Lo usamos solo para contestarte esto. No te agregamos a ninguna lista ni te llamamos para ofrecerte nada.
              </p>
            </div>

            <div>
              <label htmlFor="zona" className="block text-[12.5px] font-semibold text-fg mb-1.5">
                Zona o barrio <span className="text-faint font-medium">(opcional)</span>
              </label>
              <input id="zona" name="zona" maxLength={120} className={campo} placeholder="Belgrano, Pilar, Vicente López…" />
            </div>
          </>
        )}

        {!anonima && !privada && (
          <label className="flex gap-2.5 items-start text-[12.5px] text-soft leading-relaxed cursor-pointer">
            <input type="checkbox" name="permiso_uso" className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0" />
            <span>Si les sirve, pueden contar mi caso en el programa — sin mi nombre ni mi dirección.</span>
          </label>
        )}
      </div>

      {anonima && (
        <div className="bg-inset border border-dashed border-line/15 rounded-xl px-3.5 py-3 text-[12px] text-muted leading-relaxed flex gap-2.5">
          <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
          <span>
            <b className="text-accent">Anónimo de verdad:</b> no te pedimos nombre ni mail, y tampoco guardamos de dónde
            llegaste. Queda solo lo que escribas. Si querés que te contestemos, elegí la opción del medio.
          </span>
        </div>
      )}

      {/* Trampa para robots: invisible para las personas, no la completa nadie. */}
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute opacity-0 w-0 h-0 pointer-events-none" />

      {error && <p className="text-[12.5px] text-red-400 font-semibold">{error}</p>}

      <button type="submit" disabled={enviando}
        className="w-full py-3.5 rounded-2xl bg-accent text-[#10131a] dark:text-[#10131a] text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 transition hover:brightness-110">
        {enviando ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : <><Send size={16} /> {config?.button || 'Mandanos tu caso'}</>}
      </button>

      <p className="text-[11.5px] text-faint text-center leading-relaxed">
        Lo leemos nosotros dos, no hay nadie más atrás. No lo compartimos con nadie y no te vamos a escribir para
        ofrecerte nada.{' '}
        <a href="/privacidad" className="underline hover:text-accent transition">Qué hacemos con tus datos</a>.
      </p>
    </form>
  );
}
