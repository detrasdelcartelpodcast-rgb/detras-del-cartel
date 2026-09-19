import React from 'react';

/* ==========================================================================
   VISTA PÚBLICA "EN CONSTRUCCIÓN"
   Es lo único que ve el visitante del sitio publicado: logo grande centrado
   + barra roja fija arriba. Sin datos, sin formularios, sin recursos externos.
========================================================================== */
export default function Construccion({ logoUrl, title }) {
  return (
    <div className="min-h-screen bg-[#06090e] flex flex-col">
      <div
        role="status"
        className="fixed top-0 left-0 right-0 z-50 bg-[#C62828] text-white text-center text-[11px] md:text-sm font-bold uppercase tracking-[0.25em] py-2.5 px-4 shadow-lg"
      >
        Sitio en construcción
      </div>

      <main className="flex-1 flex items-center justify-center px-5 pt-14 pb-10">
        <img
          src={logoUrl}
          alt={title}
          className="w-[min(88vw,500px)] h-auto rounded-3xl shadow-2xl"
        />
      </main>
    </div>
  );
}
