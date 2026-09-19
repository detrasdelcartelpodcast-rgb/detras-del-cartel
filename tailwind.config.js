/** @type {import('tailwindcss').Config} */
// Colores "semánticos" que cambian con el modo día/noche (variables en src/index.css).
// Usar SIEMPRE estos nombres en secciones nuevas (bg-page, bg-card, text-fg, text-muted,
// border-line/10, text-accent...) y no colores fijos, para que respondan al modo claro.
const tok = (v) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: tok('page'),     // fondo de la página
        card: tok('card'),     // tarjetas
        card2: tok('card2'),   // tarjetas secundarias / fichas
        input: tok('input'),   // campos de formulario
        fg: tok('fg'),         // texto principal
        soft: tok('soft'),     // texto secundario fuerte
        muted: tok('muted'),   // texto secundario
        faint: tok('faint'),   // placeholders
        line: tok('line'),     // bordes y velos (se usa con /5, /10, /20)
        accent: tok('accent'), // dorado de marca para TEXTO (en claro se oscurece por contraste)
        inset: 'var(--inset)', // fondo hundido dentro de tarjetas
        track: tok('track'),   // pistas inactivas (barras del ecualizador)
      },
    },
  },
  plugins: [],
}
