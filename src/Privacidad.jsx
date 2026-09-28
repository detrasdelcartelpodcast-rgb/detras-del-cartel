import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

/* ==========================================================================
   /privacidad — QUÉ HACEMOS CON TUS DATOS

   Escrita el 27-09-2026, cuando la web empezó a guardar datos de personas.
   🔴 Regla: esta página describe lo que el código REALMENTE hace. Si algún día
   se agrega analítica, un píxel, una lista de correo o se comparte algo con un
   tercero, se actualiza ACÁ en el mismo movimiento. Una política que dice algo
   que no es cierto es peor que no tenerla.

   Lo que hay hoy, verificado en el código: no hay analítica, ni píxeles, ni
   rastreadores; el único dato en el navegador es el modo día/noche.
========================================================================== */

const ACTUALIZADA = '27 de septiembre de 2026';
const MAIL = 'detrasdelcartelpodcast@gmail.com';

function Seccion({ titulo, children }) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-[15px] md:text-base font-bold text-fg">{titulo}</h2>
      <div className="text-[13.5px] text-soft leading-relaxed space-y-2.5">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  useEffect(() => {
    document.title = 'Privacidad · Detrás del Cartel';
  }, []);

  return (
    <div className="min-h-screen bg-page text-fg">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <header className="flex items-start justify-between gap-4">
          <a href="/" className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-fg transition">
            <ArrowLeft size={15} /> Volver
          </a>
          <ThemeToggle />
        </header>

        <div className="space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">DETRÁS DEL CARTEL</p>
          <h1 className="text-2xl md:text-3xl font-black text-fg leading-tight">Qué hacemos con tus datos</h1>
          <p className="text-[13.5px] text-muted leading-relaxed">
            Última actualización: {ACTUALIZADA}.
          </p>
        </div>

        <div className="bg-card border border-line/8 rounded-2xl p-4 md:p-5 flex gap-3">
          <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
          <p className="text-[13.5px] text-soft leading-relaxed">
            <b className="text-fg">En una línea:</b> esta web no te rastrea. No tiene analítica, ni píxeles de
            publicidad, ni cookies de seguimiento. Lo único que guardamos es lo que vos nos escribas por el
            formulario, y solo para contestarte y decidir de qué hablar en el podcast.
          </p>
        </div>

        <div className="space-y-7">
          <Seccion titulo="Quiénes somos">
            <p>
              Detrás del Cartel es un podcast de Daniel Bryn y Víctor Miascovsky. Somos nosotros dos los que
              manejamos esta web y los que leemos lo que llega: no hay un equipo ni una empresa atrás. Para
              cualquier cosa relacionada con tus datos, escribinos a{' '}
              <a href={`mailto:${MAIL}`} className="text-accent underline break-all">{MAIL}</a>.
            </p>
          </Seccion>

          <Seccion titulo="Qué datos pedimos, y cuáles no">
            <p>
              El único lugar donde te pedimos algo es el formulario de <b className="text-fg">"Proponé un tema o
              hacenos tu consulta"</b>. Ahí, lo único obligatorio es el tema que querés contarnos. El resto es
              opcional y lo completás si querés: tu nombre (o un apodo), tu mail, tu WhatsApp y tu zona o barrio.
            </p>
            <p>
              Si elegís que te respondamos en privado, necesitamos <b className="text-fg">al menos una forma de
              contacto</b>: sin eso no hay manera de contestarte.
            </p>
            <p>
              <b className="text-fg">Si elegís escribirnos en forma anónima, no guardamos absolutamente ningún dato
              tuyo</b>: ni nombre, ni mail, ni teléfono, ni zona, ni desde dónde llegaste. Queda solo el texto que
              escribiste. Eso no es una promesa de palabra: nuestro sistema borra esos datos antes de guardar nada y
              la base de datos los rechaza aunque se los mandemos.
            </p>
            <p>
              <b className="text-fg">No guardamos tu dirección IP</b> en ningún caso, ni siquiera cuando la consulta
              no es anónima.
            </p>
          </Seccion>

          <Seccion titulo="Para qué los usamos">
            <p>Para dos cosas, y nada más:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Contestarte, si nos pediste una respuesta.</li>
              <li>Decidir de qué hablar en los próximos episodios.</li>
            </ul>
            <p>
              Si tu caso nos sirve para un episodio, <b className="text-fg">solo lo contamos si nos diste permiso</b>{' '}
              marcando la casilla del formulario, y siempre <b className="text-fg">sin tu nombre y sin tu
              dirección</b>. Si nos escribiste pidiendo una respuesta privada, eso no sale al aire.
            </p>
            <p>
              <b className="text-fg">No te vamos a escribir para ofrecerte nada.</b> No hay lista de difusión, no
              hay newsletter automática y tu mail o tu teléfono no entran en ninguna campaña. Si querés que
              avancemos con algo, lo decidís vos.
            </p>
          </Seccion>

          <Seccion titulo="Con quién los compartimos">
            <p>
              Con nadie. No vendemos, no cedemos ni intercambiamos tus datos con terceros, ni con agencias, ni con
              otras inmobiliarias.
            </p>
            <p>
              Lo que sí usamos son dos proveedores para que la web funcione:{' '}
              <b className="text-fg">Vercel</b>, donde vive el sitio, y <b className="text-fg">Supabase</b>, donde se
              guardan las consultas. Los dos son servicios de infraestructura con servidores fuera de la Argentina,
              y solo procesan los datos por cuenta nuestra. El acceso está restringido a nuestras dos cuentas
              personales, con clave y verificación en dos pasos.
            </p>
          </Seccion>

          <Seccion titulo="Cookies y rastreo">
            <p>
              <b className="text-fg">No usamos cookies de seguimiento, analítica ni publicidad.</b> Lo único que la
              web deja en tu navegador es si preferís verla en modo día o noche, para recordarlo la próxima vez.
              Eso no te identifica y no sale de tu dispositivo.
            </p>
            <p>
              Cuando reproducís un episodio, el video lo sirve <b className="text-fg">YouTube</b>. Lo cargamos en su
              versión "sin cookies", que no te registra hasta que apretás reproducir; a partir de ahí se aplican las
              condiciones de YouTube, que no dependen de nosotros.
            </p>
          </Seccion>

          <Seccion titulo="Cuánto tiempo los guardamos">
            <p>
              Las consultas quedan guardadas mientras nos sirvan para el podcast. Si querés que borremos la tuya,
              escribinos y la damos de baja: no hace falta que expliques por qué.
            </p>
          </Seccion>

          <Seccion titulo="Tus derechos">
            <p>
              Podés pedirnos en cualquier momento <b className="text-fg">acceder</b> a los datos que tenemos tuyos,{' '}
              <b className="text-fg">corregirlos</b> si están mal o <b className="text-fg">borrarlos</b>. Escribinos
              a <a href={`mailto:${MAIL}`} className="text-accent underline break-all">{MAIL}</a> y lo resolvemos.
              No cobramos nada por eso.
            </p>
            <p className="text-[12.5px] text-muted">
              En la Argentina esto está amparado por la Ley 25.326 de Protección de Datos Personales. La Agencia de
              Acceso a la Información Pública es el organismo de control y atiende los reclamos de quien considere
              que no se respetaron sus derechos.
            </p>
          </Seccion>

          <Seccion titulo="Menores">
            <p>Este podcast y esta web son para adultos. No pedimos ni queremos datos de menores de 18 años.</p>
          </Seccion>

          <Seccion titulo="Si esto cambia">
            <p>
              Si algún día agregamos algo que recolecte datos, lo vamos a decir acá y vas a ver la fecha de
              actualización cambiada arriba. No vamos a usar lo que ya nos escribiste para algo distinto de lo que
              dice esta página sin avisarte.
            </p>
          </Seccion>
        </div>

        <footer className="pt-6 border-t border-line/10">
          <a href="/" className="inline-flex items-center gap-2 text-[13px] text-accent hover:underline">
            <ArrowLeft size={15} /> Volver a Detrás del Cartel
          </a>
        </footer>
      </div>
    </div>
  );
}
