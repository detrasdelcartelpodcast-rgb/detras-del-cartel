import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Privacidad from './Privacidad.jsx'
import DevSimulator from './dev/DevSimulator.jsx'
import './index.css'

// Simulador de dispositivos: solo en desarrollo. En el build (import.meta.env.DEV = false)
// Vite elimina esta rama y el componente no llega al sitio publicado.
const Shell = import.meta.env.DEV ? DevSimulator : React.Fragment

// Ruteo mínimo: la web tiene pocas páginas y no justifica una librería de rutas.
// /consultas es el buzón privado (no se indexa) y /privacidad es pública.
const ruta = window.location.pathname.replace(/\/+$/, '')
const esElBuzon = ruta === '/consultas'
const esPrivacidad = ruta === '/privacidad'

// El buzón se carga aparte, solo cuando alguien entra a /consultas: así el
// visitante de la landing no descarga el cliente de Supabase, que pesa el doble
// que todo el resto del sitio junto.
const Consultas = React.lazy(() => import('./Consultas.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {esPrivacidad ? (
      <Privacidad />
    ) : esElBuzon ? (
      <Suspense fallback={<div className="min-h-screen bg-page" />}>
        <Consultas />
      </Suspense>
    ) : (
      <Shell>
        <App />
      </Shell>
    )}
  </React.StrictMode>,
)
