import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Al compilar, descarta las imágenes que NINGÚN código publicado usa.
// Motivo: mientras el sitio esté "en construcción", las fotos de los conductores
// (src/assets/hosts/) no deben quedar accesibles por URL en Vercel aunque no se muestren.
// Cuando se active esa sección, las imágenes pasan a estar referenciadas y se incluyen solas.
function purgarImagenesSinUso() {
  return {
    name: 'purgar-imagenes-sin-uso',
    apply: 'build',
    generateBundle(_, bundle) {
      const texto = Object.values(bundle)
        .map((f) => (f.type === 'chunk' ? f.code : typeof f.source === 'string' ? f.source : ''))
        .join('\n')
      for (const [nombre, f] of Object.entries(bundle)) {
        if (f.type === 'asset' && /\.(png|jpe?g|webp|gif|avif)$/i.test(nombre)) {
          if (!texto.includes(nombre.split('/').pop())) delete bundle[nombre]
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), purgarImagenesSinUso()],
})
