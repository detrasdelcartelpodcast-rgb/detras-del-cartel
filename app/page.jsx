'use client'
/* La portada. En Vite esto lo decidía un `if` sobre window.location.pathname dentro de
   main.jsx; en Next cada página es una carpeta y el ruteo lo hace el framework. */
import App from '../src/App.jsx'
import DevSimulator from '../src/dev/DevSimulator.jsx'

// El simulador de dispositivos sólo en desarrollo. Antes era `import.meta.env.DEV`, que es
// de Vite; el equivalente en Next es process.env.NODE_ENV, que también se elimina del build.
const enDesarrollo = process.env.NODE_ENV !== 'production'

export default function Portada() {
  return enDesarrollo ? <DevSimulator><App /></DevSimulator> : <App />
}
