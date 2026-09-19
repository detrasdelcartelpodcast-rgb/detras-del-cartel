import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw, GripVertical } from 'lucide-react';

/* ==========================================================================
   SIMULADOR DE DISPOSITIVOS — SOLO DESARROLLO (localhost)
   Barra flotante arrastrable: celular / tablet / PC + rotar.
   Se importa únicamente si import.meta.env.DEV: en el build de producción
   Vite lo elimina, no llega al sitio publicado.
========================================================================== */

const DEVICES = {
  mobile: { w: 393, h: 852, radius: 44 },
  tablet: { w: 820, h: 1180, radius: 28 },
};

function Toolbar({ device, setDevice, landscape, setLandscape }) {
  const ref = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (pos || !ref.current) return;
    const { offsetWidth, offsetHeight } = ref.current;
    setPos({ x: (window.innerWidth - offsetWidth) / 2, y: window.innerHeight - offsetHeight - 24 });
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const el = ref.current;
      if (!el) return;
      const x = Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - el.offsetWidth));
      const y = Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - el.offsetHeight));
      setPos({ x, y });
    };
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging]);

  const startDrag = (e) => {
    const rect = ref.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  const btn = (active, color) =>
    `p-2 rounded-lg transition ${active ? `${color} text-white` : 'text-gray-400 hover:text-white hover:bg-gray-700'}`;

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: pos?.x ?? 0, top: pos?.y ?? 0, touchAction: 'none', visibility: pos ? 'visible' : 'hidden' }}
      className={`z-[9999] flex items-center gap-3 bg-gray-900/95 backdrop-blur-md text-white p-2 pl-1 rounded-2xl shadow-2xl border border-gray-700/50 select-none ${dragging ? 'cursor-grabbing' : ''}`}
    >
      <div onPointerDown={startDrag} className="p-2 text-gray-500 hover:text-white cursor-grab touch-none">
        <GripVertical size={22} />
      </div>
      <div className="flex bg-gray-800/50 rounded-xl p-1 gap-1">
        <button onClick={() => setDevice('mobile')} className={btn(device === 'mobile', 'bg-amber-500')} title="Celular"><Smartphone size={18} /></button>
        <button onClick={() => setDevice('tablet')} className={btn(device === 'tablet', 'bg-amber-500')} title="Tablet"><Tablet size={18} /></button>
        <button onClick={() => setDevice('desktop')} className={btn(device === 'desktop', 'bg-amber-500')} title="PC"><Monitor size={18} /></button>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      <button
        onClick={() => setLandscape(!landscape)}
        disabled={device === 'desktop'}
        className={`p-2 rounded-xl transition ${device === 'desktop' ? 'opacity-20 cursor-not-allowed text-gray-500' : landscape ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Rotar"
      >
        <RotateCcw size={18} className={landscape ? 'rotate-90 transition-transform' : 'transition-transform'} />
      </button>
    </div>
  );
}

export default function DevSimulator({ children }) {
  const [device, setDeviceState] = useState('desktop');
  const [landscape, setLandscape] = useState(false);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Dentro del iframe simulado: solo el contenido (evita recursión infinita)
  if (new URLSearchParams(window.location.search).get('simulating') === 'true') return <>{children}</>;

  const setDevice = (d) => { setDeviceState(d); setLandscape(false); };
  const bar = <Toolbar device={device} setDevice={setDevice} landscape={landscape} setLandscape={setLandscape} />;

  if (device === 'desktop') return <>{children}{bar}</>;

  const { w, h, radius } = DEVICES[device];
  const width = landscape ? h : w;
  const height = landscape ? w : h;
  const bezel = 12;
  const scale = Math.min(1, (vp.w - 48) / (width + bezel * 2), (vp.h - 120) / (height + bezel * 2));

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start pt-6" style={{ height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          width: width + bezel * 2,
          height: height + bezel * 2,
          borderRadius: radius + bezel,
          background: '#0b0b0d',
          padding: bezel,
          boxShadow: '0 25px 60px rgba(0,0,0,.4)',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
        }}
      >
        <iframe
          src={`${window.location.pathname}?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(window.location.search)), simulating: 'true' })}`}
          title="Simulación de dispositivo"
          style={{ width, height, border: 0, borderRadius: radius, background: '#fff', display: 'block' }}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
      {bar}
    </div>
  );
}
