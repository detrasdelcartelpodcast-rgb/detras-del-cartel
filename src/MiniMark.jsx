import React from 'react';

/* Marca mínima (cartel + micrófono) para el encabezado, el pie y cualquier tamaño chico.

   🔴 Es EL MISMO dibujo que `app/icon.svg`, el ícono de la pestaña, a propósito: una sola
   marca en los dos lados. Si se cambia acá, cambiarlo allá (y al revés).

   Engordada el 11-10-2026. Antes el tablero del cartel era una línea de 2,6 sobre un lienzo
   de 64: a 16 px eso son 0,65 px, la línea desaparecía y quedaba un palo con una pelotita.
   Ahora va relleno y todos los trazos más gruesos, que es lo que hace falta para que algo se
   lea chico.

   Por qué no se usa el emblema cobrizo acá: se probó renderizándolo a 16, 24, 32, 48 y 64 px.
   Abajo de 48 es una mancha — la cinta con "DETRÁS DEL CARTEL" no se lee—. Lo mismo con los
   otros nueve logos de src/assets/logos/: todos llevan texto, y el texto a 24 px no existe.
   Un ícono se lee por su silueta.

   Toma el color de `currentColor`: en la web, el dorado de marca, que cambia con día/noche. */
export default function MiniMark({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      {/* micrófono asomando por detrás */}
      <rect x="30" y="4" width="11" height="16" rx="5.5" />
      <rect x="33.5" y="19" width="4" height="5" />
      {/* poste */}
      <rect x="10" y="12" width="8" height="48" rx="1.5" />
      {/* travesaño */}
      <rect x="10" y="20" width="42" height="7" rx="1.5" />
      {/* tablero colgado, RELLENO: es lo único que sobrevive a 16 px */}
      <rect x="22" y="31" width="28" height="19" rx="2" />
    </svg>
  );
}
