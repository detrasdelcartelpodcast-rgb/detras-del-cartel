import { createClient } from '@supabase/supabase-js';

/* ==========================================================================
   CLIENTE DE SUPABASE PARA EL NAVEGADOR

   Usa la clave "publishable", que es pública a propósito: cualquiera que mire
   el código del sitio la puede leer. Lo que impide que sirva para algo es RLS:
   sin una sesión de una dirección autorizada, la base devuelve cero filas.

   La clave secreta NO se importa nunca acá: vive solo en el servidor.
========================================================================== */

const url = import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hayConfiguracion = Boolean(url && clave);

export const supabase = hayConfiguracion
  ? createClient(url, clave, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/** Abre la pantalla de Google y vuelve a /consultas. */
export function entrarConGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/consultas` },
  });
}

export function salir() {
  return supabase.auth.signOut();
}
