-- ============================================================================
-- EL TELÉFONO TIENE QUE SER UN TELÉFONO (11-10-2026)
--
-- Tercera capa, igual que con el mail. Las otras dos son el formulario (avisa
-- en el momento) y lib/consultas.js (revisa en el servidor). Ésta es la que no
-- se puede saltear: aunque alguien le pegue directo a la base con la clave
-- secreta, un «no tengo» no entra.
--
-- Qué pedimos: entre 8 y 14 dígitos, ignorando espacios, guiones, paréntesis y
-- el +. Así pasan «11 5555 5555», «+54 11 5555-5555» y «+598 99 123 456», y no
-- pasan «no tengo», «a» ni «123».
--
-- 🔴 Antes de aplicarlo, mirar qué filas quedarían afuera:
--   select id, telefono from public.consultas
--    where telefono is not null
--      and length(regexp_replace(telefono, '[^0-9]', '', 'g')) not between 8 and 14;
-- Si hay alguna, se arregla a mano primero: un constraint no se agrega sobre
-- datos que ya lo violan (PostgreSQL lo rechaza y no pasa nada malo, pero el
-- script falla y conviene saber por qué).
-- ============================================================================

alter table public.consultas drop constraint if exists telefono_de_verdad;
alter table public.consultas add constraint telefono_de_verdad check (
  telefono is null
  or length(regexp_replace(telefono, '[^0-9]', '', 'g')) between 8 and 14
);
