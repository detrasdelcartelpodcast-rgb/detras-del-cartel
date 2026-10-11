import { useEffect, useState } from 'react';

// Modo día / noche. Arranca según el modo del dispositivo del visitante y recuerda
// su elección si la cambia con el botón. Sin scripts inline (compatible con la CSP).
const KEY = 'dc-theme';

function guardado() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function inicial() {
  const g = guardado();
  if (g) return g;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useTheme() {
  /* 🔴 ARRANCA SIEMPRE EN 'dark', NO EN LO QUE PREFIERE EL VISITANTE (11-10-2026, al pasar a
     Next). Con Vite la página se armaba entera en el navegador, así que `inicial()` podía leer
     localStorage y matchMedia desde el primer render. Next arma el HTML en el SERVIDOR, donde
     no existe ninguno de los dos: leerlos ahí rompe el build («window is not defined»).
     Y aunque se los esquivara, el servidor no puede saber qué modo prefiere el visitante, así
     que el HTML y el navegador dirían cosas distintas.
     Por eso: se arranca en el modo noche —que es el de la marca y el que ve la mayoría— y en
     cuanto el componente vive en el navegador se corrige al que corresponda. */
  const [theme, setTheme] = useState('dark');

  useEffect(() => { setTheme(inicial()); }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Si el modo cambia en otra pestaña o en la vista de dispositivo simulado, se sincroniza.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) setTheme(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = () =>
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch { /* sin almacenamiento: solo dura la visita */ }
      return next;
    });

  return [theme, toggle];
}
