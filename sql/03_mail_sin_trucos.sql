-- =============================================================================
-- DETRÁS DEL CARTEL — la dirección de mail no puede traer caracteres de URL
--
-- Por qué: una dirección como "victima@mail.com?bcc=otro%40evil.com" pasaba la
-- validación vieja. Al apretar "Responder por mail" en el buzón, el programa de
-- correo abría el mensaje con una copia oculta hacia un tercero, y la respuesta
-- a una consulta privada (una herencia, un divorcio) se le escapaba a alguien
-- de afuera. Se corrigió en el servidor y en la pantalla; esta restricción es
-- la tercera capa, para que lo garantice la base y no dependa del código.
--
-- Correr en: SQL Editor → New query → pegar → Run.
-- =============================================================================

-- Por si quedó alguna dirección rara de antes: se vacía (no se borra la consulta).
update public.consultas
set email = null
where email is not null
  and email !~ '^[^[:space:]@?&=%"''<>,;:]+@[^[:space:]@?&=%"''<>,;:]+\.[A-Za-z]{2,}$';

alter table public.consultas drop constraint if exists mail_sin_trucos;
alter table public.consultas add constraint mail_sin_trucos check (
  email is null
  or email ~ '^[^[:space:]@?&=%"''<>,;:]+@[^[:space:]@?&=%"''<>,;:]+\.[A-Za-z]{2,}$'
);

comment on column public.consultas.email is
  'Dirección de contacto. No puede contener caracteres de URL (? & = % comillas): '
  'con ellos se podía colar una copia oculta en el enlace "Responder por mail" del buzón.';
