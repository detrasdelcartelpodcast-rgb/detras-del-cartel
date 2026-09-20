import React from 'react';

/**
 * Logotipo "Detrás del Cartel", emblema partido (cartel EN VENTA a la izquierda, estudio a la derecha).
 * Recibido de otra herramienta (Stitch/Gemini) el 20-09-2026; convertido del SVG 09-...svg, mismo dibujo.
 * ⚠ NO está en uso. Es una RECREACIÓN en código, no el diseño original: ver LEEME.md.
 * Los `id` de degradados/filtro son fijos: dos copias en la misma página (o SVG con los mismos ids) chocan.
 */
export default function DetrasDelCartelSplitEmblem({ className = "w-96 h-auto" }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none bg-white p-4 rounded-2xl ${className}`}>
      <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="Detrás del Cartel">
        <defs>
    <linearGradient id="metalRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#EAA676" />
      <stop offset="25%" stopColor="#8E4624" />
      <stop offset="50%" stopColor="#F2BE9B" />
      <stop offset="75%" stopColor="#6B2E15" />
      <stop offset="100%" stopColor="#E29562" />
    </linearGradient>
    <radialGradient id="studioWarmthGrad" cx="65%" cy="45%" r="55%">
      <stop offset="0%" stopColor="#EAA676" />
      <stop offset="45%" stopColor="#C26A3B" />
      <stop offset="80%" stopColor="#6E2F16" />
      <stop offset="100%" stopColor="#260F06" />
    </radialGradient>
    <linearGradient id="navySplitGrad" x1="0%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stopColor="#06101E" />
      <stop offset="100%" stopColor="#0F243E" />
    </linearGradient>
    <linearGradient id="woodTextureGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#A56535" />
      <stop offset="25%" stopColor="#7B421C" />
      <stop offset="65%" stopColor="#55270A" />
      <stop offset="100%" stopColor="#8F4F24" />
    </linearGradient>
    <linearGradient id="vintageMicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FDE5D2" />
      <stop offset="35%" stopColor="#D97A47" />
      <stop offset="70%" stopColor="#8F3E18" />
      <stop offset="100%" stopColor="#FCE5D2" />
    </linearGradient>
    <clipPath id="circleSceneClip">
      <circle cx="512" cy="450" r="280" />
    </clipPath>
    <filter id="badgeShadowFilter" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0B192C" floodOpacity="0.3" />
    </filter>
  </defs>

  
  <g filter="url(#badgeShadowFilter)">
    {/* marco exterior */}
    <circle cx="512" cy="450" r="308" fill="#0B192C" />
    <circle cx="512" cy="450" r="296" fill="none" stroke="url(#metalRingGrad)" strokeWidth="12" />
    <circle cx="512" cy="450" r="284" fill="none" stroke="#0B192C" strokeWidth="4" />

    {/* escena recortada al círculo */}
    <g clipPath="url(#circleSceneClip)">
      <rect x="200" y="150" width="620" height="620" fill="url(#studioWarmthGrad)" />

      {/* planos y paneles acústicos */}
      <g stroke="#FADBC4" strokeWidth="1.3" opacity="0.25" fill="none">
        <rect x="540" y="240" width="160" height="130" />
        <line x1="540" y1="290" x2="700" y2="290" />
        <line x1="630" y1="240" x2="630" y2="370" />
        <path d="M 630 310 A 30 30 0 0 1 660 340" />
        <rect x="560" y="390" width="190" height="150" />
        <line x1="560" y1="460" x2="750" y2="460" />
        <g strokeWidth="1" opacity="0.4">
          <polygon points="690,280 715,260 715,300" fill="#42190A" />
          <polygon points="715,260 740,280 715,300" fill="#6B2E15" />
          <polygon points="690,320 715,300 715,340" fill="#42190A" />
          <polygon points="715,300 740,320 715,340" fill="#6B2E15" />
          <polygon points="690,360 715,340 715,380" fill="#42190A" />
          <polygon points="715,340 740,360 715,380" fill="#6B2E15" />
        </g>
      </g>

      {/* ondas sonoras */}
      <g stroke="url(#metalRingGrad)" strokeWidth="2.5" fill="none" opacity="0.75">
        <circle cx="650" cy="485" r="50" />
        <circle cx="650" cy="485" r="80" />
        <circle cx="650" cy="485" r="115" />
        <circle cx="650" cy="485" r="155" />
        <circle cx="650" cy="485" r="200" strokeDasharray="10 8" />
      </g>

      {/* mitad izquierda azul noche y línea del "reveal" */}
      <path d="M 512 170 C 532 280, 482 360, 422 450 C 372 520, 402 620, 472 730 L 200 730 L 200 170 Z" fill="url(#navySplitGrad)" />
      <path d="M 512 170 C 532 280, 482 360, 422 450 C 372 520, 402 620, 472 730" fill="none" stroke="#FCE5D2" strokeWidth="3" opacity="0.6" />

      {/* poste vertical de madera */}
      <polygon points="287,210 327,210 327,630 287,630" fill="url(#woodTextureGrad)" stroke="#2B1408" strokeWidth="3" />
      <line x1="299" y1="220" x2="299" y2="620" stroke="#48220A" strokeWidth="2" opacity="0.6" />
      <line x1="314" y1="220" x2="314" y2="620" stroke="#8E481E" strokeWidth="1.5" opacity="0.5" />
      <polygon points="287,210 307,185 327,210" fill="#BD723A" />

      {/* travesaño */}
      <polygon points="252,250 507,265 507,305 252,290" fill="url(#woodTextureGrad)" stroke="#2B1408" strokeWidth="3.5" />
      <polygon points="252,250 267,260 267,300 252,290" fill="#3D1A06" />
      <circle cx="307" cy="272" r="5" fill="#E2A275" stroke="#1D0C04" strokeWidth="2" />

      {/* anillas */}
      <line x1="342" y1="278" x2="342" y2="325" stroke="#D19266" strokeWidth="4" strokeLinecap="round" />
      <line x1="447" y1="284" x2="447" y2="330" stroke="#D19266" strokeWidth="4" strokeLinecap="round" />
      <circle cx="342" cy="325" r="4.5" fill="#3A1706" stroke="#D19266" strokeWidth="2" />
      <circle cx="447" cy="330" r="4.5" fill="#3A1706" stroke="#D19266" strokeWidth="2" />

      {/* tablero "EN VENTA" */}
      <rect x="317" y="325" width="160" height="195" rx="7" fill="#0B192C" stroke="#D98A55" strokeWidth="4.5" />
      <rect x="327" y="335" width="140" height="135" rx="4" fill="#060F1A" />
      <rect x="327" y="475" width="140" height="36" fill="#C26A3B" />
      <text x="397" y="395" fill="#FCE5D2" fontSize="32" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" letterSpacing="2" textAnchor="middle">EN</text>
      <text x="397" y="448" fill="#FCE5D2" fontSize="34" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" letterSpacing="2.5" textAnchor="middle">VENTA</text>

      {/* micrófono vintage */}
      <g transform="translate(650, 485)">
        <ellipse cx="0" cy="115" rx="45" ry="12" fill="#240D05" opacity="0.6" />
        <path d="M -40 110 C -40 98, 40 98, 40 110 Z" fill="url(#vintageMicGrad)" stroke="#3E1505" strokeWidth="3" />
        <rect x="-8" y="70" width="16" height="35" rx="3" fill="url(#vintageMicGrad)" stroke="#3E1505" strokeWidth="2" />
        <rect x="-14" y="66" width="28" height="8" rx="2" fill="#FDE1CB" stroke="#3E1505" strokeWidth="2" />
        <path d="M -42 -20 C -48 55, 48 55, 42 -20" fill="none" stroke="url(#vintageMicGrad)" strokeWidth="8" strokeLinecap="round" />
        <path d="M -42 -20 C -48 55, 48 55, 42 -20" fill="none" stroke="#2B0E03" strokeWidth="2" />
        <circle cx="-42" cy="-20" r="5.5" fill="#FDE1CB" stroke="#2B0E03" strokeWidth="2" />
        <circle cx="42" cy="-20" r="5.5" fill="#FDE1CB" stroke="#2B0E03" strokeWidth="2" />
        <rect x="-27" y="-15" width="54" height="42" rx="4" fill="url(#vintageMicGrad)" stroke="#2B0E03" strokeWidth="3" />
        <rect x="-29" y="-2" width="58" height="6" fill="#FDE1CB" stroke="#2B0E03" strokeWidth="2" />
        <path d="M -26 -15 C -26 -65, 26 -65, 26 -15 Z" fill="url(#vintageMicGrad)" stroke="#2B0E03" strokeWidth="3" />
        <g stroke="#3A1406" strokeWidth="1.5" opacity="0.85">
          <line x1="-20" y1="-50" x2="-20" y2="-15" />
          <line x1="-12" y1="-60" x2="-12" y2="-15" />
          <line x1="-4" y1="-63" x2="-4" y2="-15" />
          <line x1="4" y1="-63" x2="4" y2="-15" />
          <line x1="12" y1="-60" x2="12" y2="-15" />
          <line x1="20" y1="-50" x2="20" y2="-15" />
          <line x1="-24" y1="-25" x2="24" y2="-25" />
          <line x1="-22" y1="-37" x2="22" y2="-37" />
          <line x1="-18" y1="-48" x2="18" y2="-48" />
        </g>
        <path d="M -18 -45 C -18 -58, -2 -58, -2 -45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.75" strokeLinecap="round" />
      </g>
    </g>

    <line x1="222" y1="635" x2="802" y2="635" stroke="#0B192C" strokeWidth="6" />

    {/* bloque tipográfico inferior */}
    <g transform="translate(512, 725)" textAnchor="middle">
      <text y="0" fontFamily="'Impact', 'Arial Black', sans-serif" fontSize="62" letterSpacing="2.5" fontWeight="900">
        <tspan fill="#0B192C">DETRÁS DEL </tspan>
        <tspan fill="url(#metalRingGrad)" stroke="#0B192C" strokeWidth="2">CARTEL</tspan>
      </text>
      <g transform="translate(0, 32)">
        <polygon points="0,-4 5,0 0,4 -5,0" fill="#C26A3B" />
        <line x1="-230" y1="0" x2="-15" y2="0" stroke="url(#metalRingGrad)" strokeWidth="1.8" opacity="0.85" />
        <line x1="15" y1="0" x2="230" y2="0" stroke="url(#metalRingGrad)" strokeWidth="1.8" opacity="0.85" />
      </g>
      <text y="58" fill="#C26A3B" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="900" letterSpacing="5.5">REAL ESTATE PODCAST</text>
      <path d="M -190 76 C -95 114, 95 114, 190 76" fill="none" stroke="url(#metalRingGrad)" strokeWidth="7" strokeLinecap="round" />
      <path d="M -170 88 C -85 124, 85 124, 170 88" fill="none" stroke="#0B192C" strokeWidth="2.5" />
    </g>
  </g>
      </svg>
    </div>
  );
}
