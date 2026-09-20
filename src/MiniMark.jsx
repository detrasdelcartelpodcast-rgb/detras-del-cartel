import React from 'react';

// Marca mínima (cartel + micrófono) para el menú y tamaños chicos. Vector simple, nítido a 32 px.
// BORRADOR: el diseño fino se define después; se reemplaza por el logo definitivo simplificado.
// Toma el color de `currentColor` (en la web, el dorado de marca que cambia con el modo día/noche).
export default function MiniMark({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      {/* micrófono */}
      <rect x="31" y="5" width="8" height="13" rx="4" />
      <path d="M28.5 13a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="34" y="18" width="2" height="3" />
      {/* poste y travesaño del cartel */}
      <rect x="13" y="16" width="5" height="42" rx="1" />
      <path d="M13 16l2.5-3 2.5 3z" />
      <rect x="13" y="21" width="36" height="4.5" rx="1" />
      {/* tablero colgado */}
      <rect x="25" y="28" width="22" height="15" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <rect x="28" y="25" width="1.8" height="3" />
      <rect x="42.5" y="25" width="1.8" height="3" />
    </svg>
  );
}
