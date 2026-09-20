import React from 'react';

/**
 * Logotipo "Detrás del Cartel", versión cartel despegado + "LO QUE NO TE CUENTAN".
 * Recibido de otra herramienta el 20-09-2026 (convertido del SVG 08-...svg, mismo dibujo).
 * ⚠ NO está en uso. Revisar antes de usar: ver LEEME.md (el dibujo no coincide con la descripción:
 * el micrófono queda tapado y la solapa cubre el texto "VENTA"). Los `id` de degradados/filtro son
 * fijos: si se muestran dos copias en la misma página, o junto a otro SVG con los mismos ids, chocan.
 */
export default function CartelDespegadoLogo({ className = "w-96 h-auto" }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none bg-white p-4 rounded-xl ${className}`}>
      <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Detrás del Cartel">
        <defs>
    <linearGradient id="woodPostGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#C96B32" />
      <stop offset="60%" stopColor="#DE7E3F" />
      <stop offset="100%" stopColor="#BA5F27" />
    </linearGradient>
    <linearGradient id="signBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#C4582E" />
      <stop offset="100%" stopColor="#A84520" />
    </linearGradient>
    <linearGradient id="peelBackGrad" x1="20%" y1="80%" x2="80%" y2="20%">
      <stop offset="0%" stopColor="#D98A36" />
      <stop offset="50%" stopColor="#EBB04D" />
      <stop offset="100%" stopColor="#F5C469" />
    </linearGradient>
    <filter id="peelShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#0B192C" floodOpacity="0.25" />
    </filter>
  </defs>

  
  {/* ESTRUCTURA DE MADERA: POSTE Y TRAVESAÑO */}
  <g stroke="#0B192C" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
    <rect x="180" y="95" width="42" height="365" rx="21" fill="url(#woodPostGrad)" />
    <rect x="155" y="125" width="345" height="30" rx="15" fill="url(#woodPostGrad)" />
    <line x1="275" y1="155" x2="275" y2="175" stroke="#0B192C" strokeWidth="10" />
    <line x1="445" y1="155" x2="445" y2="175" stroke="#0B192C" strokeWidth="10" />
  </g>

  {/* ELEMENTOS REVELADOS DETRÁS DEL CARTEL: PLANOS + MICRÓFONO + ONDAS */}
  <g transform="translate(400, 240)">
    <g stroke="#E5A93C" strokeWidth="2.4" opacity="0.85">
      <line x1="-85" y1="110" x2="120" y2="-80" strokeDasharray="3 3" />
      <line x1="-40" y1="130" x2="90" y2="10" />
      <line x1="30" y1="140" x2="125" y2="55" />
      <line x1="-30" y1="-20" x2="110" y2="115" />
      <circle cx="-50" cy="70" r="4" fill="#E5A93C" />
      <circle cx="105" cy="-65" r="4" fill="#E5A93C" />
      <circle cx="105" cy="5" r="8" fill="none" />
      <line x1="105" y1="-8" x2="105" y2="18" />
      <line x1="92" y1="5" x2="118" y2="5" />
      <circle cx="-60" cy="115" r="7" fill="none" />
      <line x1="-60" y1="104" x2="-60" y2="126" />
      <line x1="-71" y1="115" x2="-49" y2="115" />
    </g>
    <g stroke="#E5A93C" strokeWidth="5.5" strokeLinecap="round" fill="none">
      <path d="M 75 18 C 90 28, 90 48, 75 58" />
      <path d="M 92 8 C 115 22, 115 54, 92 68" />
      <path d="M 109 -2 C 140 16, 140 60, 109 78" />
    </g>
    <g transform="translate(45, 10)">
      <path d="M -18 105 L 18 105" stroke="#E5A93C" strokeWidth="6" strokeLinecap="round" />
      <line x1="0" y1="84" x2="0" y2="105" stroke="#E5A93C" strokeWidth="6" strokeLinecap="round" />
      <path d="M -24 38 C -24 75, 24 75, 24 38" fill="none" stroke="#E5A93C" strokeWidth="6" strokeLinecap="round" />
      <path d="M -16 18 C -16 8, -2 4, 0 4 L 0 54 C -8 54, -16 46, -16 38 Z" fill="#C96B32" />
      <path d="M 16 18 C 16 8, 2 4, 0 4 L 0 54 C 8 54, 16 46, 16 38 Z" fill="#E5A93C" />
      <rect x="-16" y="4" width="32" height="50" rx="16" fill="none" stroke="#E5A93C" strokeWidth="5" />
      <line x1="-14" y1="20" x2="14" y2="20" stroke="#0B192C" strokeWidth="3" />
      <line x1="-15" y1="28" x2="15" y2="28" stroke="#0B192C" strokeWidth="3" />
      <line x1="-14" y1="36" x2="14" y2="36" stroke="#0B192C" strokeWidth="3" />
    </g>
  </g>

  {/* CARTEL COLGANTE CON ESQUINA DESPEGADA */}
  <g id="cartel-hanging">
    <path d="M 330 380 C 370 330, 440 250, 480 230 L 460 380 Z" fill="#0B192C" opacity="0.15" />
    <path d="M 252 170 L 468 170 C 477 170, 485 178, 485 187 L 485 240 C 425 255, 360 315, 335 385 L 252 385 C 243 385, 235 377, 235 368 L 235 187 C 235 178, 243 170, 252 170 Z" fill="url(#signBgGrad)" stroke="#0B192C" strokeWidth="12" strokeLinejoin="round" />
    <g fill="#0B192C" fontFamily="'Impact', 'Arial Black', sans-serif" fontWeight="900" textAnchor="middle">
      <text x="360" y="248" fontSize="48" letterSpacing="2">EN</text>
      <text x="360" y="302" fontSize="50" letterSpacing="3">VENTA</text>
    </g>
    <path d="M 335 385 C 365 315, 425 255, 485 240 C 455 310, 395 370, 335 385 Z" fill="url(#peelBackGrad)" stroke="#0B192C" strokeWidth="11" strokeLinejoin="round" filter="url(#peelShadow)" />
    <path d="M 350 380 C 380 320, 435 270, 475 255" fill="none" stroke="#D98A36" strokeWidth="4" />
  </g>

  {/* TIPOGRAFÍA INFERIOR */}
  <g textAnchor="middle">
    <text x="350" y="545" fill="#0B192C" fontFamily="'Impact', 'Arial Black', -apple-system, sans-serif" fontSize="62" fontWeight="900" letterSpacing="2.5px">DETRÁS DEL CARTEL</text>
    <text x="350" y="588" fill="#0B192C" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontSize="21" fontWeight="900" letterSpacing="5.5px">LO QUE NO TE CUENTAN</text>
  </g>
      </svg>
    </div>
  );
}
