/* ============================================================================
   EL TELÉFONO: UNA SOLA REGLA, USADA EN LOS TRES LADOS

   La usan el formulario (`src/Formulario.jsx`), el servidor que guarda
   (`lib/consultas.js`) y el botón de WhatsApp del buzón (`src/Consultas.jsx`).
   Está acá, y no copiada en cada uno, porque si el formulario pide una cosa y
   el servidor otra, el que se equivoca es el que carga la consulta.

   🔴 POR QUÉ EXISTE ESTE ARCHIVO (11-10-2026). Antes el teléfono no se validaba
   en NINGUNA capa: se probó contra la web publicada y entraron «no tengo», la
   letra «a» y «123». Dos consecuencias reales:

     · En una consulta privada el sistema pide «dejanos un mail o un WhatsApp».
       Con cualquier texto se cumplía el requisito, y quedaba una consulta que
       PIDE RESPUESTA y a la que no se puede contestar.
     · Ese texto alimentaba el botón de WhatsApp, que armaba el enlace sacando
       todo lo que no fuera número. El botón se veía igual de bien en los tres
       casos y no llevaba a ninguna parte.
============================================================================ */

/* Los países que tiene sentido ofrecer: el nuestro y adonde está la gente que
   puede escribir. No es la lista del mundo entero a propósito — una lista de
   200 países es peor de usar que una de 13. Si hace falta otro, se agrega acá. */
export const PAISES = [
  { codigo: '54', nombre: 'Argentina', bandera: '🇦🇷', ejemplo: '11 5555 5555' },
  { codigo: '598', nombre: 'Uruguay', bandera: '🇺🇾', ejemplo: '99 123 456' },
  { codigo: '56', nombre: 'Chile', bandera: '🇨🇱', ejemplo: '9 1234 5678' },
  { codigo: '55', nombre: 'Brasil', bandera: '🇧🇷', ejemplo: '11 91234 5678' },
  { codigo: '595', nombre: 'Paraguay', bandera: '🇵🇾', ejemplo: '981 123 456' },
  { codigo: '591', nombre: 'Bolivia', bandera: '🇧🇴', ejemplo: '7123 4567' },
  { codigo: '51', nombre: 'Perú', bandera: '🇵🇪', ejemplo: '912 345 678' },
  { codigo: '57', nombre: 'Colombia', bandera: '🇨🇴', ejemplo: '301 234 5678' },
  { codigo: '52', nombre: 'México', bandera: '🇲🇽', ejemplo: '55 1234 5678' },
  { codigo: '34', nombre: 'España', bandera: '🇪🇸', ejemplo: '612 345 678' },
  { codigo: '39', nombre: 'Italia', bandera: '🇮🇹', ejemplo: '312 345 6789' },
  { codigo: '1', nombre: 'EE.UU. / Canadá', bandera: '🇺🇸', ejemplo: '305 123 4567' },
  { codigo: '972', nombre: 'Israel', bandera: '🇮🇱', ejemplo: '50 123 4567' },
]

export const PAIS_POR_DEFECTO = '54'

export const soloDigitos = (v) => String(v ?? '').replace(/\D/g, '')

/* Cuántos dígitos tiene que tener el número SIN el código de país.
   8 es el piso real: el móvil más corto de la lista (Uruguay) tiene 8. 14 es el
   techo que admite el estándar internacional contando el país. */
export const MINIMO_DIGITOS = 8
export const MAXIMO_DIGITOS = 14

/** ¿Esto que escribió la persona es un teléfono, o es cualquier cosa? */
export function telefonoValido(numero) {
  const d = soloDigitos(numero)
  return d.length >= MINIMO_DIGITOS && d.length <= MAXIMO_DIGITOS
}

/** Lo que se guarda: "+54 11 5555 5555". Se conserva cómo lo escribió la
 *  persona —espacios y guiones incluidos— porque así es más fácil de leer en el
 *  buzón; lo único que se agrega adelante es el país.
 *
 *  🔴 Y SE SACA EL PAÍS SI LA PERSONA YA LO ESCRIBIÓ. Mucha gente tiene el
 *  número guardado como «+54 9 11 5555 5555» y lo pega entero en el campo, sin
 *  mirar que al lado ya dice +54. Sin esto quedaba «+54 +54 9 11…» y el enlace
 *  de WhatsApp apuntaba a un número con el país repetido. Lo encontró la prueba
 *  de esta misma función, no el ojo. */
export function armarTelefono(codigoPais, numero) {
  let n = String(numero ?? '').trim().replace(/\s+/g, ' ')
  if (!n) return null
  const pais = soloDigitos(codigoPais) || PAIS_POR_DEFECTO

  // Si ya empieza con el país (con + o sin él), se lo saca para no duplicarlo.
  // Sólo si lo que queda sigue siendo un número razonable: si no, era parte del
  // número de verdad y hay que dejarlo en paz.
  const sinMas = n.replace(/^\+\s*/, '')
  if (soloDigitos(sinMas).startsWith(pais)) {
    const resto = sinMas.replace(/^[\s-]*/, '').slice(pais.length).replace(/^[\s-]+/, '')
    if (soloDigitos(resto).length >= MINIMO_DIGITOS) n = resto
  }
  return `+${pais} ${n}`
}

/* ─────────────────────────────────────────────────────────────────────────────
   EL ENLACE DE WHATSAPP

   🔴 LA TRAMPA ARGENTINA, que es la que hace fallar el botón sin avisar:
   para un celular argentino WhatsApp NO quiere 54 11 5555 5555, quiere
   54 **9** 11 5555 5555. Ese 9 no se marca al llamar y nadie lo escribe, así
   que jamás va a venir en lo que carga la persona: hay que ponerlo acá.
   Sin él, WhatsApp abre «el número no está en WhatsApp» y parece que el
   problema es del contacto.
───────────────────────────────────────────────────────────────────────────── */
export function enlaceWhatsApp(telefonoGuardado) {
  const guardado = String(telefonoGuardado ?? '').trim()
  let d = soloDigitos(guardado)
  if (!d) return null

  /* 🔴 El "+" es lo que distingue un número nuevo de uno viejo, y no hay que
     adivinar nada más. Desde el 11-10-2026 todo lo que entra se guarda con el
     país adelante («+54 …»). Lo que está guardado SIN "+" es de antes, cuando
     el campo era texto libre, y era gente de acá: se asume Argentina.

     El primer intento fue mirar si los dígitos ya empezaban con algún código de
     país conocido. No sirve: el «1» de Estados Unidos coincide con el principio
     de cualquier número porteño, así que «11 555 5555» se tomaba como yanqui y
     el enlace salía sin el 54. Lo encontró la prueba de la función. */
  if (!guardado.startsWith('+')) d = PAIS_POR_DEFECTO + d

  if (d.startsWith('54') && !d.startsWith('549')) d = '549' + d.slice(2)
  if (d.length < MINIMO_DIGITOS) return null
  return `https://wa.me/${d}`
}
