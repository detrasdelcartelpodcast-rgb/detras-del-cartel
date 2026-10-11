'use client'
/* El buzón privado. Next lo separa solo en su propio paquete, así que el visitante de la
   portada sigue sin descargar el cliente de Supabase — que era el motivo del React.lazy()
   que había en Vite, y ya no hace falta escribirlo a mano. */
import Consultas from '../../src/Consultas.jsx'
export default function Pagina() { return <Consultas /> }
