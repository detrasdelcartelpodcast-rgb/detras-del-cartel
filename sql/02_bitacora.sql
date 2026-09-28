-- =============================================================================
-- DETRÁS DEL CARTEL — bitácora de seguimiento de cada consulta
--
-- Por qué una tabla aparte y no un campo de texto: un campo se pisa. Acá cada
-- anotación queda con su fecha y quién la escribió, una debajo de la otra, y
-- la historia no se pierde.
--
-- Correr en: SQL Editor → New query → pegar → Run. Se puede correr más de una vez.
-- =============================================================================

create table if not exists public.consulta_notas (
  id          bigint generated always as identity primary key,
  consulta_id bigint not null references public.consultas (id) on delete cascade,
  texto       text not null check (length(btrim(texto)) between 1 and 4000),
  autor       text,                      -- la dirección de quien la escribió
  creado_en   timestamptz not null default now()
);

comment on table public.consulta_notas is
  'Anotaciones de seguimiento de cada consulta (qué se hizo, qué contestó la persona). '
  'Solo las ven y las escriben las direcciones autorizadas. Nunca se muestran en la web pública.';

create index if not exists consulta_notas_por_consulta_idx
  on public.consulta_notas (consulta_id, creado_en desc);

alter table public.consulta_notas enable row level security;

-- Las lee quien puede ver el buzón.
drop policy if exists "las notas las leen los autorizados" on public.consulta_notas;
create policy "las notas las leen los autorizados"
  on public.consulta_notas for select
  to authenticated
  using (exists (
    select 1 from public.autorizados a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  ));

-- Las escribe quien puede ver el buzón, y el autor tiene que ser él mismo:
-- así nadie puede anotar en nombre de otro.
drop policy if exists "las notas las escriben los autorizados" on public.consulta_notas;
create policy "las notas las escriben los autorizados"
  on public.consulta_notas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.autorizados a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
    and lower(coalesce(autor, '')) = lower(auth.jwt() ->> 'email')
  );

-- Una anotación se puede corregir o borrar solo por quien la escribió.
drop policy if exists "cada uno corrige sus notas" on public.consulta_notas;
create policy "cada uno corrige sus notas"
  on public.consulta_notas for update
  to authenticated
  using (lower(coalesce(autor, '')) = lower(auth.jwt() ->> 'email'))
  with check (lower(coalesce(autor, '')) = lower(auth.jwt() ->> 'email'));

drop policy if exists "cada uno borra sus notas" on public.consulta_notas;
create policy "cada uno borra sus notas"
  on public.consulta_notas for delete
  to authenticated
  using (lower(coalesce(autor, '')) = lower(auth.jwt() ->> 'email'));

-- Lo que ya estuviera escrito en el campo viejo de observaciones pasa a ser la
-- primera anotación, para no perderlo. Se hace una sola vez.
insert into public.consulta_notas (consulta_id, texto, autor, creado_en)
select c.id, c.observaciones, 'migrado', c.creado_en
from public.consultas c
where coalesce(btrim(c.observaciones), '') <> ''
  and not exists (
    select 1 from public.consulta_notas n
    where n.consulta_id = c.id and n.autor = 'migrado'
  );
