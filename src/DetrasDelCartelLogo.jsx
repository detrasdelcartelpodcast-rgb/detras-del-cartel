import React from 'react';

/**
 * Logo Oficial "Detrás del Cartel" - Edición Espacio Negativo Alta Gama
 * Recreación vectorial 1:1
 */
export default function DetrasDelCartelLogo({ className = "w-full max-w-md", showBackground = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto select-none drop-shadow-sm"
      >
        <defs>
          {/* Sombras y acabados ópticos */}
          <filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 1. Fondo off-white / lienzo cálido editorial */}
        {showBackground && (
          <rect width="800" height="800" rx="32" fill="#F9F8F5" />
        )}

        {/* 2. ESTRUCTURA DEL POSTE Y CARTEL */}
        <g transform="translate(0, -10)">
          
          {/* --- SOMBRAS CÁLIDAS / VOLUMETRÍA EN OCRE-TERRACOTA --- */}
          {/* Sombra lateral del poste vertical */}
          <polygon points="271,215 279,228 279,505 271,495" fill="#C88344" />
          
          {/* Sombra inferior del travesaño horizontal */}
          <polygon points="215,225 585,225 572,238 215,238" fill="#C88344" />
          
          {/* Sombra de la punta derecha del travesaño */}
          <polygon points="585,200 598,212 598,225 585,225" fill="#C88344" />

          {/* Sombra inferior y lateral derecha del cartel colgante */}
          <polygon points="555,255 565,268 565,446 555,435" fill="#C88344" />
          <polygon points="300,435 555,435 565,446 310,446" fill="#C88344" />

          {/* --- ESTRUCTURA PRINCIPAL EN AZUL NOCHE (NAVY #0B192C) --- */}
          {/* Poste vertical con corte en ángulo superior */}
          <polygon points="256,170 243,182 243,505 271,505 271,182" fill="#0B192C" />
          {/* Remate de la punta superior del poste */}
          <polygon points="256,170 271,182 243,182" fill="#0B192C" />

          {/* Travesaño horizontal */}
          <rect x="210" y="200" width="375" height="25" rx="2" fill="#0B192C" />

          {/* Argollas / ganchos de sujeción metálicos */}
          <rect x="332" y="225" width="10" height="30" rx="2" fill="#0B192C" />
          <rect x="508" y="225" width="10" height="30" rx="2" fill="#0B192C" />

          {/* Tablero principal del Cartel */}
          <rect x="296" y="255" width="258" height="180" rx="10" fill="#0B192C" />

          {/* --- TEXTO "SE VENDE" --- */}
          <text
            x="425"
            y="312"
            fill="#FFFFFF"
            fontSize="46"
            fontWeight="900"
            letterSpacing="0.06em"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Arial Black', sans-serif"
          >
            SE VENDE
          </text>

          {/* --- METÁFORA: PUERTA ABIERTA (DOORWAY) EN OCRE CÁLIDO --- */}
          {/* Marco exterior y perspectiva de la puerta abierta */}
          <polygon points="418,335 492,318 492,476 418,488" fill="#DF9649" />
          {/* Borde interior / grosor de la puerta */}
          <polygon points="418,335 425,338 425,485 418,488" fill="#C88344" />
          {/* Cara interna batiente en blanco/luz */}
          <polygon points="436,338 484,328 484,468 436,478" fill="#FFFFFF" />
          {/* Picaporte o cerradura minimalista */}
          <circle cx="474" cy="406" r="3.5" fill="#0B192C" />

          {/* --- ISOTIPO: MICRÓFONO EN ESPACIO NEGATIVO --- */}
          {/* Cuerpo / cápsula principal del micrófono */}
          <rect x="373" y="342" width="46" height="74" rx="23" fill="#0B192C" stroke="#F9F8F5" strokeWidth="8" />
          {/* Ranuras acústicas del micrófono (acento negativo) */}
          <line x1="384" y1="368" x2="397" y2="368" stroke="#F9F8F5" strokeWidth="4" strokeLinecap="round" />
          <line x1="384" y1="380" x2="397" y2="380" stroke="#F9F8F5" strokeWidth="4" strokeLinecap="round" />
          <line x1="418" y1="368" x2="430" y2="368" stroke="#0B192C" strokeWidth="4" strokeLinecap="round" />
          <line x1="418" y1="380" x2="430" y2="380" stroke="#0B192C" strokeWidth="4" strokeLinecap="round" />

          {/* Horquilla / arco de suspensión exterior */}
          <path
            d="M366 384 C366 430, 426 430, 426 384"
            fill="none"
            stroke="#0B192C"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Pie vertical y peana del micrófono */}
          <line x1="396" y1="428" x2="396" y2="456" stroke="#0B192C" strokeWidth="8" strokeLinecap="round" />
          <line x1="378" y1="456" x2="414" y2="456" stroke="#0B192C" strokeWidth="8" strokeLinecap="round" />
        </g>

        {/* 3. BLOQUE TIPOGRÁFICO EDITORIAL INFERIOR */}
        <g transform="translate(400, 608)" textAnchor="middle">
          {/* TÍTULO PRINCIPAL: "DETRÁS DEL CARTEL" */}
          <text
            y="0"
            fill="#0B192C"
            fontSize="54"
            fontWeight="900"
            letterSpacing="0.04em"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', sans-serif"
          >
            DETRÁS DEL CARTEL
          </text>

          {/* SUBTÍTULO: "CON DANIEL BRYN & VÍCTOR MIASCOVSKY" */}
          <text
            y="42"
            fill="#C88344"
            fontSize="21"
            fontWeight="800"
            letterSpacing="0.08em"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', sans-serif"
          >
            CON DANIEL BRYN &amp; VÍCTOR MIASCOVSKY
          </text>
        </g>
      </svg>
    </div>
  );
}
