-- =============================================================================
-- DETRÁS DEL CARTEL — tabla de consultas del formulario de la web
-- Proyecto Supabase PROPIO del podcast (detras-del-cartel). NO se comparte con
-- ninguna base del ecosistema Inmovalue.
--
-- Cómo correrlo: panel de Supabase → SQL Editor → New query → pegar todo → Run.
-- Es seguro correrlo más de una vez (usa IF NOT EXISTS / CREATE OR REPLACE).
--
-- Decisiones que están escritas acá adentro y no en un documento aparte:
--  · Las consultas anónimas NO pueden tener datos de contacto: lo impide la base,
--    no la pantalla. Es la única forma de que el "anónimo" del formulario sea cierto.
--  · Las que piden respuesta TIENEN que traer mail o teléfono: sin eso no hay
--    forma de contestar y la persona queda esperando.
--  · Nada se borra: se marca como borrada y se puede recuperar.
--  · RLS activo y cerrado: nadie lee nada desde el navegador salvo las
--    direcciones autorizadas. El formulario escribe por el servidor.
-- =============================================================================

-- ── Quién puede entrar al buzón ──────────────────────────────────────────────
-- Para sumar a Daniel: insertar su dirección acá y listo, sin tocar políticas.
create table if not exists public.autorizados (
  email text primary key,
  nombre text,
  creado_en timestamptz not null default now()
);

comment on table public.autorizados is
  'Direcciones de Google que pueden ver el buzón de consultas. Se administra a mano.';

insert into public.autorizados (email, nombre)
values ('detrasdelcartelpodcast@gmail.com', 'Cuenta del podcast')
on conflict (email) do nothing;

-- ── Las consultas ────────────────────────────────────────────────────────────
create table if not exists public.consultas (
  -- Número visible (#0001, #0002…). Correlativo y cronológico; no se reutiliza.
  id                bigint generated always as identity primary key,
  creado_en         timestamptz not null default now(),

  -- Qué pidió la persona en el formulario
  tipo              text not null check (tipo in ('programa', 'privado', 'anonimo')),
  tema              text not null check (length(btrim(tema)) between 3 and 300),
  detalle           text check (length(detalle) <= 4000),

  -- Datos de contacto (siempre nulos si es anónima: ver la restricción de abajo)
  nombre            text check (length(nombre) <= 120),
  email             text check (length(email) <= 200),
  telefono          text check (length(telefono) <= 40),
  zona              text check (length(zona) <= 120),
  permiso_uso       boolean not null default false,
  origen            text check (length(origen) <= 200),

  -- Seguimiento nuestro (eje 1: dónde está)
  situacion         text not null default 'nueva'
                      check (situacion in ('nueva', 'en_curso', 'cerrada')),

  -- (eje 2: qué hay que hacer, mientras está en curso)
  proximo_paso      text check (proximo_paso in (
                      'contestar_mail', 'llamar_whatsapp', 'desarrollar_episodio', 'esperando_respuesta')),
  recordar_el       date,

  -- (eje 3: cómo terminó, al cerrarla)
  desenlace         text check (desenlace in ('episodio', 'respondida', 'descartada', 'duplicada')),
  episodio          integer check (episodio > 0),
  duplicada_de      bigint references public.consultas (id) on delete set null,

  etiquetas         text[] not null default '{}',
  prioritaria       boolean not null default false,
  observaciones     text check (length(observaciones) <= 4000),

  -- Borrado lógico (nunca se elimina la fila)
  borrada           boolean not null default false,
  borrada_en        timestamptz,

  actualizado_en    timestamptz not null default now(),

  -- El anonimato lo garantiza la base: si es anónima no puede haber NINGÚN dato
  -- que permita identificar a la persona, ni siquiera de dónde llegó.
  constraint anonima_sin_datos check (
    tipo <> 'anonimo' or (
      nombre is null and email is null and telefono is null
      and zona is null and origen is null
    )
  ),

  -- Si pidió respuesta, tiene que haber por dónde contestarle.
  constraint privada_con_contacto check (
    tipo <> 'privado' or (coalesce(email, '') <> '' or coalesce(telefono, '') <> '')
  ),

  -- Coherencia del cierre: una consulta cerrada dice cómo terminó, y una que
  -- sigue abierta no puede tener desenlace.
  constraint cierre_coherente check (
    (situacion = 'cerrada' and desenlace is not null)
    or (situacion <> 'cerrada' and desenlace is null)
  ),
  constraint episodio_solo_si_salio check (desenlace is distinct from 'episodio' or episodio is not null),
  constraint duplicada_apunta_a_otra check (desenlace is distinct from 'duplicada' or duplicada_de is not null)
);

comment on table public.consultas is
  'Consultas que llegan del formulario de detrasdelcartel (sección "Proponé un tema"). '
  'Las escribe el servidor con la clave secreta; las lee el buzón en /consultas. '
  'Contiene datos personales: nunca exponer sin RLS.';

comment on column public.consultas.tipo is 'programa = para tratar al aire · privado = pide respuesta · anonimo = sin ningún dato';
comment on column public.consultas.origen is 'De dónde llegó (campaña, red). Siempre nulo en las anónimas.';
comment on column public.consultas.duplicada_de is 'Consulta original cuando alguien pregunta lo mismo: sirve para saber qué tema se repite.';

-- Índices para las vistas del buzón (lo nuevo primero, lo pendiente, la papelera).
create index if not exists consultas_recientes_idx on public.consultas (creado_en desc) where not borrada;
create index if not exists consultas_situacion_idx on public.consultas (situacion) where not borrada;
create index if not exists consultas_etiquetas_idx on public.consultas using gin (etiquetas);

-- Mantiene actualizado_en al día sin que haya que acordarse.
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  -- Deja registrado cuándo se mandó a la papelera (y lo limpia al restaurar).
  if new.borrada and not old.borrada then
    new.borrada_en := now();
  elsif not new.borrada then
    new.borrada_en := null;
  end if;
  return new;
end;
$$;

drop trigger if exists consultas_actualizado_en on public.consultas;
create trigger consultas_actualizado_en
  before update on public.consultas
  for each row execute function public.tocar_actualizado_en();

-- ── Seguridad: cerrado por defecto ───────────────────────────────────────────
alter table public.consultas enable row level security;
alter table public.autorizados enable row level security;

-- Sin políticas para el público: quien tenga la clave del navegador NO puede
-- leer, escribir ni borrar nada. El formulario inserta desde el servidor con la
-- clave secreta, que no pasa por RLS.
drop policy if exists "el buzon lo leen los autorizados" on public.consultas;
create policy "el buzon lo leen los autorizados"
  on public.consultas for select
  to authenticated
  using (exists (
    select 1 from public.autorizados a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  ));

drop policy if exists "el buzon lo edita quien puede verlo" on public.consultas;
create policy "el buzon lo edita quien puede verlo"
  on public.consultas for update
  to authenticated
  using (exists (
    select 1 from public.autorizados a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  ))
  with check (exists (
    select 1 from public.autorizados a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  ));

-- Nadie borra filas desde el navegador: el borrado es lógico (columna borrada).
-- Tampoco se puede insertar desde el navegador: eso lo hace el servidor.

drop policy if exists "cada uno se ve a si mismo en la lista" on public.autorizados;
create policy "cada uno se ve a si mismo en la lista"
  on public.autorizados for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));
