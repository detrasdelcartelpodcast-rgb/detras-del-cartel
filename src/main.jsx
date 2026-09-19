import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import DevSimulator from './dev/DevSimulator.jsx'
import './index.css'

// Simulador de dispositivos: solo en desarrollo. En el build (import.meta.env.DEV = false)
// Vite elimina esta rama y el componente no llega al sitio publicado.
const Shell = import.meta.env.DEV ? DevSimulator : React.Fragment

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Shell>
      <App />
    </Shell>
  </React.StrictMode>,
)
