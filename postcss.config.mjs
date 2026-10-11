/* .mjs y no .js (11-10-2026): el archivo está escrito con `export default`, que es el
   formato nuevo, pero con el nombre `.js` Node no puede saberlo de antemano y avisaba en cada
   arranque —el cartel rojo «1 Issue» del servidor de desarrollo—. La otra salida era declarar
   `"type": "module"` en package.json, pero eso cambia la regla para TODOS los `.js` del
   proyecto (tools/, lib/) y puede romper lo que hoy anda. Renombrar sólo afecta a este. */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
