import React, { useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Share2, Radio, CheckCircle2, Send, ChevronRight, ShieldCheck, TrendingUp, Compass, Users, MessageSquare, Volume2, Clock, Headphones, HelpCircle, Lock, Briefcase } from 'lucide-react';
import DetrasDelCartelLogo from './DetrasDelCartelLogo';
import Construccion from './Construccion';
import ThemeToggle from './ThemeToggle';
import { useEpisodios, UltimoEpisodio, EpisodiosAnteriores } from './Episodios';
import MiniMark from './MiniMark';
import { useTheme } from './theme';
import fotoDaniel from './assets/hosts/daniel-bryn.jpg';
import fotoVictor from './assets/hosts/victor-miascovsky.jpg';
import emblema from './assets/logos/12-emblema-cobrizo-final-TRANSPARENTE-764.webp';

/* ==========================================================================
   CONFIGURACIÓN EDITABLE (CAMBIÁ ACÁ FOTOS, TEXTOS, LINKS Y EPISODIOS)
========================================================================== */
export const siteConfig = {
  // 0. Estado de publicación
  //  publicarCompleto: true  → el sitio publicado muestra la landing COMPLETA.
  //  publicarCompleto: false → el sitio publicado muestra solo el logo + barra "en construcción".
  //  Los episodios se leen SOLOS del canal de YouTube (ver src/Episodios.jsx y api/episodios.js): sin videos → "Muy pronto".
  sitio: { publicarCompleto: true },

  // 1. Control de visibilidad de secciones (true / false)
  // Todo activo: este es el PROTOTIPO que se ve en localhost.
  // El sitio publicado (Vercel) NO usa estos interruptores: muestra solo el logo + barra
  // "en construcción" (ver src/Construccion.jsx y la variable `construccion` más abajo).
  sections: {
    header: true,         // barra superior fija ("ESTUDIO CENTRAL" + botón Enviar caso)
    hero: true,           // portada con el logo
    heroBadges: false,    // etiquetas "EDICIÓN DE COLECCIÓN / VOL. 02" (fuera: no dicen nada al oyente y requieren mantenimiento manual)
    heroDetails: true,    // badges "EDICIÓN DE COLECCIÓN / VOL. 02" + tagline de la portada
    channels: true,
    featuredPlayer: true,
    mythAudit: true,
    hosts: true,
    recentCases: true,
    consultationBox: true,
    footer: true,
    bottomNav: true       // dock inferior móvil
  },


  // 2. Identidad y Portada Oficial
  brand: {
    title: "DETRÁS DEL CARTEL",
    hostsSubtitle: "CON DANIEL BRYN & VÍCTOR MIASCOVSKY",
    editionBadge: "EDICIÓN DE COLECCIÓN",
    volTag: "VOL. 02",
    slogan: "EL LADO B DEL MERCADO INMOBILIARIO",
    tagline: "Tips y casos reales, en primera persona. Lo que hay detrás del cartel, explicado sin vueltas.",
    ctaHeader: "ESCUCHAR",
    headerSubtitle: "Podcast inmobiliario",
    // Podés poner acá tu imagen subida (URL de S3, Cloudinary o carpeta /public/logo.png).
    // Si dejás useVectorLogo: true, se dibuja el SVG de espacio negativo de alta gama.
    useVectorLogo: false,
    customLogoImageUrl: "/logo.png"
  },

  // 3. Canales Oficiales y Enlaces
  channels: [
    {
      id: "spotify",
      name: "Spotify",
      badge: "ESCUCHALO",
      url: "", // pegar acá el enlace del podcast en Spotify cuando exista
    },
    {
      id: "youtube",
      name: "YouTube",
      badge: "MIRÁ LOS EPISODIOS",
      url: "https://www.youtube.com/@detrasdelcartelpodcast",
    },
    {
      id: "apple",
      name: "Apple Podcasts",
      badge: "ESCUCHALO",
      url: "", // pegar acá el enlace del podcast en Apple Podcasts cuando exista
    },
    {
      id: "instagram",
      name: "Instagram",
      badge: "SEGUINOS",
      url: "https://www.instagram.com/detrasdelcartelpodcast/",
    }
  ],

  // 4. Expediente en Reproducción (Player Hi-Fi)

  // 5. Mito Patrimonial Auditado
  myth: {
    refCode: "MITO O REALIDAD",
    verdict: "MITO",
    quote: "“Publicalo un 15% más caro para tener margen de negociación.”",
    verdictTitle: "LA REALIDAD:",
    explanation: "Parece prudente, pero suele jugar en contra: quien busca dentro de un rango de precio no llega a ver tu propiedad, y la que sí se ve se compara con las de al lado. Empezar en un precio ajustado a lo que hoy se paga suele dar más margen real que empezar alto."
  },


  // 6. Conductores (Fotos, Datos y Bio 100% editables)
  hosts: [
    {
      name: "Daniel Bryn",
      role: "MERCADO & DATOS",
      bio: "Contador y corredor inmobiliario. Escucha cada caso antes de opinar y lo explica con datos.",
      highlight: "En cada episodio traduce los números del mercado a lenguaje claro.",
      // Foto real de Daniel (src/assets/hosts/). Para cambiarla, reemplazar el archivo:
      photoUrl: fotoDaniel
    },
    {
      name: "Víctor Miascovsky",
      role: "NEGOCIACIÓN & FINANZAS",
      bio: "Contador y consultor inmobiliario. Escucha cada caso antes de opinar y lo analiza con números.",
      highlight: "En cada episodio explica cómo se negocia una operación y qué hay detrás de cada cifra.",
      // Foto real de Víctor (src/assets/hosts/). Para cambiarla, reemplazar el archivo:
      photoUrl: fotoVictor
    }
  ],

  // 6b. Recuadro "JUNTOS" bajo las dos bios: para qué es el podcast y qué hay detrás del cartel
  // (PROPUESTA 20-09, a validar por Vic y Daniel). Un solo texto + etiquetas de temas y emociones.
  hostsTogether: {
    tag: "JUNTOS",
    before: "Sabemos que te mudás pocas veces en la vida y que hay mucho en juego: una familia que creció, una herencia, un cambio de vida, una inversión que da miedo. Se decide con emoción y después se justifica con la razón. Acá hablamos de las dos cosas, con información clara y tips para que lo transites con la mayor certeza posible. Por eso te contamos, en primera persona, todo lo que hay ",
    brand: "DETRÁS DEL CARTEL",
    after: "…",
    topics: ["PRECIO", "NEGOCIACIÓN", "PAPELES", "HERENCIAS", "INVERSIÓN", "MIEDO", "FRUSTRACIÓN", "MALAS EXPERIENCIAS", "DESCONOCIMIENTO", "DESCONFIANZA", "PROCRASTINACIÓN"]
  },


  // 7. Episodios anteriores (EJEMPLOS del prototipo local; en la web pública van los reales de YouTube)

  // 8. Buzón Confidencial (Quincenal)
  consultation: {
    tag: "PROPONÉ UN TEMA",
    title: "¿Qué querés que hablemos en el podcast?",
    subtitle: "Contanos qué te preocupa o qué te pasó con tu propiedad. Elegimos los temas más pedidos para los próximos episodios. Si usamos tu caso, lo contamos sin nombres ni direcciones.",
    button: "Contanos tu caso",
    email: "detrasdelcartelpodcast@gmail.com",
    subject: "Tema para Detrás del Cartel",
    body: "Tema que me interesa:\n\n\nMi caso (opcional):\n\n\nAcepto que mi caso se use en el programa, sin nombres ni direcciones.",
    note: "Se abre tu correo con un mensaje listo para completar. Si no se abre, escribinos a"
  },


  // 9. Métricas de Impacto

  // 10. Datos de Contacto y Footer
  contact: {
    email: "detrasdelcartelpodcast@gmail.com",
    city: "Buenos Aires, Argentina",
    website: "www.detrasdelcartel.com"
  }
};

/* ==========================================================================
   LOGOTIPOS OFICIALES ORIGINALES (SVG Vectorial Directo)
========================================================================== */

// 1. Instagram Oficial Original: Gradiente multicolor exacto + Cámara blanca
function InstagramIcon({ className = "w-9 h-9" }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center p-1.5 shadow-md shrink-0 border border-white/20`}>
      <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  );
}

// 2. Apple Podcasts Oficial Original: Gradiente púrpura exacto + Ondas concéntricas y cabezal
function ApplePodcastsIcon({ className = "w-9 h-9" }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-[#B150F2] via-[#872EC4] to-[#5914A8] text-white flex items-center justify-center p-1.5 shadow-md shrink-0 border border-[#B150F2]/40`}>
      <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
        <path d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12c0 4.75 3.48 8.687 8.04 9.38v-4.14a1.86 1.86 0 0 1-.84-1.57c0-1.03.835-1.866 1.866-1.866s1.867.836 1.867 1.866c0 .668-.35 1.253-.873 1.583v4.136c4.542-.712 8.007-4.639 8.007-9.389C21.5 6.753 17.247 2.5 12 2.5zm0 4.28c2.867 0 5.22 2.353 5.22 5.22 0 1.282-.465 2.458-1.241 3.371l-1.082-1.082a3.676 3.676 0 0 0 .79-2.289 3.687 3.687 0 0 0-3.687-3.687 3.687 3.687 0 0 0-3.687 3.687c0 .878.307 1.687.82 2.322l-1.087 1.088A5.184 5.184 0 0 1 6.78 12c0-2.867 2.353-5.22 5.22-5.22zm0 2.613c1.424 0 2.607 1.183 2.607 2.607 0 .692-.275 1.32-.72 1.78l-1.06-1.06a.754.754 0 0 0 .28-.58c0-.62-.5-1.12-1.12-1.12s-1.12.5-1.12 1.12c0 .237.073.456.198.638l-1.047 1.047a2.585 2.585 0 0 1-.638-1.745c0-1.424 1.183-2.607 2.607-2.607z"/>
      </svg>
    </div>
  );
}

// 3. Spotify Oficial Original: Círculo verde #1DB954 con ondas
function SpotifyIcon({ className = "w-9 h-9" }) {
  return (
    <div className={`${className} rounded-xl bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center p-2 shadow-md shrink-0 border border-[#1DB954]/30`}>
      <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm5.503 17.309c-.216.353-.674.464-1.027.249-2.812-1.718-6.352-2.107-10.521-1.155-.403.092-.804-.162-.896-.565-.092-.402.163-.804.565-.896 4.568-1.043 8.487-.601 11.63 1.34.353.216.465.674.249 1.027zm1.469-3.267c-.272.443-.853.582-1.296.31-3.219-1.979-8.126-2.552-11.933-1.396-.499.152-1.026-.134-1.177-.633-.152-.499.134-1.026.633-1.177 4.354-1.321 9.774-.682 13.463 1.585.443.272.582.853.31 1.296zm.126-3.41c-3.86-2.292-10.228-2.504-13.905-1.388-.592.18-1.222-.153-1.402-.745-.18-.592.153-1.222.745-1.402 4.234-1.285 11.267-1.034 15.698 1.597.533.317.708 1.01.392 1.543-.317.534-1.01.709-1.543.392z"/>
      </svg>
    </div>
  );
}

// 4. YouTube Oficial Original: Placa roja #FF0000 con triángulo blanco
function YouTubeIcon({ className = "w-9 h-9" }) {
  return (
    <div className={`${className} rounded-xl bg-[#FF0000]/20 text-[#FF0000] flex items-center justify-center p-2 shadow-md shrink-0 border border-[#FF0000]/30`}>
      <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    </div>
  );
}

// Isotipo de Espacio Negativo Alta Gama Vectorial
function LogoEspacioNegativoVectorial() {
  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto rounded-3xl bg-[#0e1320] border border-amber-500/20 shadow-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-black/60 pointer-events-none" />
      <svg viewBox="0 0 160 130" className="w-44 h-36 drop-shadow-xl relative z-10" fill="none">
        {/* Poste y travesaño */}
        <path d="M30 18V122" stroke="#D97706" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M28 24H132" stroke="#D97706" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M30 42L48 24" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
        {/* Herrajes */}
        <line x1="56" y1="24" x2="56" y2="38" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="112" y1="24" x2="112" y2="38" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cartel principal */}
        <rect x="42" y="38" width="84" height="64" rx="5" fill="#0A0E17" stroke="#F1F5F9" strokeWidth="3" />
        <rect x="46" y="42" width="76" height="56" rx="3" fill="#0F172A" />
        <text x="84" y="55" fill="#F59E0B" fontSize="9" fontWeight="900" letterSpacing="0.08em" textAnchor="middle" fontFamily="sans-serif">
          SE VENDE
        </text>
        {/* Puerta abierta dorada */}
        <polygon points="73,63 94,60 94,92 73,95" fill="#F59E0B" opacity="0.9" />
        <line x1="73" y1="63" x2="73" y2="95" stroke="#B45309" strokeWidth="1.5" />
        {/* Micrófono en espacio negativo */}
        <rect x="79" y="66" width="10" height="15" rx="5" fill="#FFFFFF" />
        <path d="M75 74C75 80 79 84 84 84C89 84 93 80 93 74" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="84" x2="84" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="90" x2="88" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      
      <div className="text-center mt-3 relative z-10">
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white uppercase font-sans">
          {siteConfig.brand.title}
        </h2>
        <p className="text-[10px] md:text-xs tracking-widest text-amber-400 font-mono font-bold mt-1 uppercase">
          {siteConfig.brand.hostsSubtitle}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   COMPONENTE PRINCIPAL DE LA LANDING
========================================================================== */
export default function DetrasDelCartelLanding() {
  const { sitio, sections, brand, channels, myth, hosts, hostsTogether, consultation, contact } = siteConfig;

  // Sitio publicado = solo logo + barra "en construcción" (si sitio.publicarCompleto es false).
  // En localhost se ve el prototipo completo; ?produccion=1 muestra la vista en construcción.
  const construccion = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).has('produccion')
    : !sitio.publicarCompleto;

  const [theme, toggleTheme] = useTheme();
  const { estado, episodios } = useEpisodios(!construccion);      // lee el canal de YouTube (solo si se muestra la landing completa)
  const [elegidoId, setElegidoId] = useState(null);
  const activo = episodios.find((e) => e.id === elegidoId) || episodios[0] || null;
  const canalYoutube = (channels.find((c) => c.id === 'youtube') || {}).url;
  const elegirEpisodio = (id) => {
    setElegidoId(id);
    const el = document.getElementById('episodio');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (construccion) return <Construccion logoUrl={brand.customLogoImageUrl} title={brand.title} theme={theme} onToggleTheme={toggleTheme} />;

  return (
    <div className="min-h-screen bg-page text-fg font-sans antialiased pb-24 md:pb-12 selection:bg-amber-500/30 selection:text-accent">
      
      {/* ─── 1. HEADER FIJO (RESPONSIVE DESKTOP & MOBILE) ─── */}
      {sections.header && (
      <header className="sticky top-0 z-50 backdrop-blur-md bg-page/90 border-b border-line/5 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-card2 border border-amber-500/30 flex items-center justify-center text-accent shadow-inner">
            <MiniMark className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[12px] md:text-[13px] font-black uppercase tracking-wider text-fg leading-tight">
              {brand.title}
            </span>
            <p className="text-[10px] font-mono text-muted uppercase tracking-tight">
              {brand.headerSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <a 
          href="#episodio" 
          className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-[#07090E] font-extrabold text-xs md:text-sm flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
        >
          <span>{brand.ctaHeader}</span>
          <ChevronRight className="w-4 h-4" />
        </a>
        </div>
      </header>
      )}

      {/* ─── CONTENEDOR PRINCIPAL FLUIDO (CENTRALIZADO Y RESPONSIVE) ─── */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 md:pt-10 space-y-10 md:space-y-14">
        
        {/* ─── 2. HERO: PORTADA OFICIAL Y LOGO CONFIGURABLE ─── */}
        {sections.hero && (
          <section className="tarjeta-portada relative overflow-hidden rounded-3xl bg-gradient-to-b from-line/[0.04] to-transparent p-5 md:p-8 border border-line/5 shadow-2xl text-center space-y-5">
            {sections.heroBadges && (
            <div className="flex items-center justify-between max-w-sm md:max-w-md mx-auto">
              <span className="text-[10px] md:text-xs font-mono tracking-widest text-accent uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                {brand.editionBadge}
              </span>
              <span className="text-[10px] md:text-xs font-mono text-muted bg-line/5 px-3 py-1 rounded-md border border-line/5 font-bold">
                {brand.volTag}
              </span>
            </div>
            )}
            
            {/* Logo del hero: emblema cobrizo con fondo transparente (flota sobre la página en día y en noche) */}
            <img
              src={emblema}
              alt={brand.title}
              className="w-full max-w-sm md:max-w-md mx-auto h-auto select-none drop-shadow-2xl"
            />

            {sections.heroDetails && (
            <p className="text-[11px] md:text-xs font-mono font-bold uppercase tracking-[0.22em] text-accent">
              {brand.slogan}
            </p>
            )}

            {sections.heroDetails && (
            <p className="text-xs md:text-sm text-soft leading-relaxed max-w-md mx-auto font-sans font-medium">
              {brand.tagline}
            </p>
            )}
          </section>
        )}

        {/* ─── 3. CANALES & FEEDS (LOGOS OFICIALES ORIGINALES) ─── */}
        {sections.channels && (
          <section id="canales" className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2 text-accent">
                <Radio className="w-4 h-4" />
                <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-soft font-bold">
                  ESCUCHANOS EN
                </h2>
              </div>
            </div>
            
            {/* Grilla: 2 columnas en mobile, 4 columnas en desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {channels.map((ch) => {
                const activo = Boolean(ch.url);
                const Tag = activo ? 'a' : 'div';
                const linkProps = activo ? { href: ch.url, target: '_blank', rel: 'noopener noreferrer' } : { 'aria-disabled': true };
                return (
                <Tag
                  key={ch.id}
                  {...linkProps}
                  className={`p-3.5 rounded-2xl bg-card border border-line/5 flex items-center space-x-3 transition group shadow-md ${activo ? 'hover:border-amber-500/40' : 'opacity-60 cursor-default'}`}
                >
                  {ch.id === "spotify" && <SpotifyIcon />}
                  {ch.id === "youtube" && <YouTubeIcon />}
                  {ch.id === "apple" && <ApplePodcastsIcon />}
                  {ch.id === "instagram" && <InstagramIcon />}
                  <div>
                    <span className="text-[8px] md:text-[9px] font-mono block tracking-wider uppercase text-muted font-bold">
                      {activo ? ch.badge : "PRÓXIMAMENTE"}
                    </span>
                    <span className={`text-xs md:text-sm font-bold text-fg transition ${activo ? 'group-hover:text-accent' : ''}`}>
                      {ch.name}
                    </span>
                  </div>
                </Tag>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── 4. ÚLTIMO EPISODIO (automático desde YouTube) ─── */}
        {sections.featuredPlayer && (
          <UltimoEpisodio estado={estado} episodios={episodios} activo={activo} canalUrl={canalYoutube} />
        )}

        {/* ─── 5. MITO PATRIMONIAL AUDITADO ─── */}
        {sections.mythAudit && (
          <section className="rounded-2xl bg-card border-l-4 border-l-amber-400 border border-line/5 p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between text-[10px] md:text-xs font-mono">
              <span className="text-accent font-bold">{myth.refCode}</span>
              <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded uppercase font-bold border border-rose-500/20">
                {myth.verdict}
              </span>
            </div>
            <blockquote className="text-sm md:text-base font-semibold text-fg italic leading-snug">
              {myth.quote}
            </blockquote>
            <p className="text-xs md:text-sm text-soft leading-relaxed border-t border-line/5 pt-3">
              <span className="text-accent font-bold font-mono mr-1.5">{myth.verdictTitle}</span>
              {myth.explanation}
            </p>
          </section>
        )}

        {/* ─── 6. CONDUCTORES CON FOTOS EDITABLES ─── */}
        {sections.hosts && (
          <section id="conductores" className="space-y-4">
            <div>
              <span className="text-[10px] md:text-xs font-mono text-accent uppercase tracking-widest font-bold block">
                DETRÁS DEL MICRÓFONO
              </span>
              <h2 className="text-xl md:text-2xl font-black text-fg mt-1">Los Conductores</h2>
              <p className="text-xs md:text-sm text-muted mt-1 max-w-xl">
                Una forma distinta de contar el mercado inmobiliario: con empatía y con oficio en las negociaciones difíciles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-3 text-xs md:text-sm text-soft">
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
              <span>
                <strong className="text-accent">+20 años acumulados</strong> asesorando y auditando operaciones, con mirada financiera: para decidir con datos y más certeza, no con presentimientos. No lo tomamos a la ligera: sabemos que lo que está en juego es tu patrimonio.
              </span>
            </div>

            {/* Grilla: 1 columna en mobile, 2 en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hosts.map((host, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-card border border-line/5 space-y-3 flex flex-col justify-between">
                  <div className="flex items-start space-x-4">
                    {/* FOTO DEL CONDUCTOR (Reemplazable en siteConfig.hosts) */}
                    <img 
                      src={host.photoUrl} 
                      alt={host.name} 
                      className="w-16 h-16 rounded-2xl object-cover object-top border border-amber-400/30 shrink-0 shadow-md"
                    />
                    <div>
                      <span className="text-[9px] md:text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">
                        {host.role}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-fg mt-0.5">{host.name}</h3>
                      <p className="text-xs text-soft mt-1 leading-relaxed">{host.bio}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-line/5 flex items-center space-x-2 text-[11px] text-soft font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{host.highlight}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recuadro JUNTOS: un solo texto que abarca las dos bios + etiquetas */}
            <div className="p-5 md:p-6 rounded-2xl bg-card border border-amber-500/20 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <span className="text-[9px] md:text-[10px] font-mono text-accent font-bold uppercase tracking-wider block">
                  {hostsTogether.tag}
                </span>
                <p className="text-xs md:text-sm text-soft mt-1 leading-relaxed">
                  {hostsTogether.before}
                  <strong className="text-accent font-black tracking-wide">{hostsTogether.brand}</strong>
                  {hostsTogether.after}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hostsTogether.topics.map((t, i) => (
                    <span key={i} className="text-[8px] md:text-[9px] font-mono text-muted bg-line/5 px-2.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 7. EPISODIOS ANTERIORES (automático; se muestra desde el 2.º video) ─── */}
        {sections.recentCases && (
          <EpisodiosAnteriores episodios={episodios} activo={activo} onElegir={elegirEpisodio} />
        )}

        {/* ─── 8. BUZÓN DE CASOS (QUINCENAL & ANÓNIMO) ─── */}
        {sections.consultationBox && (
          <section id="buzon" className="rounded-3xl bg-card2 border border-amber-500/20 p-6 md:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            
            <div>
              <span className="text-[9px] md:text-[10px] font-mono text-accent uppercase tracking-widest font-bold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {consultation.tag}
              </span>
              <h2 className="text-lg md:text-2xl font-black text-fg mt-1 leading-snug">
                {consultation.title}
              </h2>
              <p className="text-xs md:text-sm text-muted mt-2 leading-relaxed max-w-xl">
                {consultation.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`mailto:${consultation.email}?subject=${encodeURIComponent(consultation.subject)}&body=${encodeURIComponent(consultation.body)}`}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#07090E] font-black text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <span>{consultation.button}</span>
                <Send className="w-4 h-4" />
              </a>
              <p className="text-[11px] md:text-xs text-muted leading-relaxed">
                {consultation.note} <span className="text-soft font-semibold select-all">{consultation.email}</span>.
              </p>
            </div>
          </section>
        )}

        {/* ─── 10. FOOTER ─── */}
        {sections.footer && (
          <footer className="space-y-6 pt-4 pb-8 text-muted">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-card2 border border-amber-500/30 flex items-center justify-center text-accent">
                    <MiniMark className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-fg tracking-wider">DETRÁS DEL CARTEL</h3>
                    <p className="text-[11px] text-muted">
                      Podcast inmobiliario con Daniel Bryn y Víctor Miascovsky.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 text-xs font-mono">
                <div>
                  <span className="text-fg font-bold block mb-2">ESCUCHANOS</span>
                  {channels.filter((c) => c.url).map((c) => (
                    <p key={c.id}>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">{c.name}</a>
                    </p>
                  ))}
                </div>
                <div>
                  <span className="text-fg font-bold block mb-2">CONTACTO</span>
                  <p className="break-all">
                    <a href={`mailto:${contact.email}`} className="hover:text-accent transition">{contact.email}</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-line/5 space-y-1.5 text-[10px] md:text-xs font-mono text-muted">
              <p>© 2026 Detrás del Cartel.</p>
              <p>Este programa es informativo y no reemplaza el asesoramiento profesional para tu caso.</p>
            </div>
          </footer>
        )}

      </main>

      {/* ─── 11. DOCK INFERIOR FIJO (SOLO EN MÓVIL: md:hidden) ─── */}
      {sections.bottomNav && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-page/95 backdrop-blur-lg border-t border-line/10 px-6 py-2.5 flex justify-around items-center">
        <a href="#episodio" className="flex flex-col items-center text-accent">
          <Headphones className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-1 font-bold">Episodios</span>
        </a>
        <a href="#canales" className="flex flex-col items-center text-muted hover:text-fg transition">
          <Radio className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-1">Escuchar</span>
        </a>
        <a href="#conductores" className="flex flex-col items-center text-muted hover:text-fg transition">
          <Users className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-1">Nosotros</span>
        </a>
        <a href="#buzon" className="flex flex-col items-center text-muted hover:text-fg transition">
          <HelpCircle className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-1">Temas</span>
        </a>
      </nav>
      )}

    </div>
  );
}
