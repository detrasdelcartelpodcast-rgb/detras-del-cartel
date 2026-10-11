-- ============================================================================
-- QUIÉN SE ESTÁ OCUPANDO DE CADA CONSULTA (11-10-2026)
--
-- El problema. Vic y Daniel entran al buzón con la MISMA cuenta, la del
-- proyecto (decisión de Vic, 27-09). Eso quiere decir que la base no tiene cómo
-- saber quién es quién: la bitácora firma todas las anotaciones con la misma
-- dirección, y una consulta que pide respuesta no dice a cuál de los dos le
-- toca. El riesgo real no es de seguridad, es de trabajo: que contesten los dos
-- o que no conteste ninguno porque cada uno supone que el otro ya lo hizo.
--
-- La solución barata: una columna donde se anota a mano quién la toma. No
-- adivina nada —no hay con qué adivinar— pero alcanza para repartirse el
-- trabajo y para filtrar «lo mío».
--
-- Se deja vacía por defecto: una consulta recién llegada no es de nadie todavía.
--
-- 🔴 ESTO HAY QUE CORRERLO ANTES de usar la pantalla nueva. Si la columna no
-- existe, al elegir una persona la pantalla intenta guardar un campo que la
-- base no conoce y da error.
--
-- Cómo correrlo: panel de Supabase → SQL Editor → pegar → Run.
-- Tiene que decir "Success. No rows returned".
-- ============================================================================

alter table public.consultas
  add column if not exists atendida_por text
  check (atendida_por is null or atendida_por in ('vic', 'daniel'));

comment on column public.consultas.atendida_por is
  'Cuál de los dos se ocupa de esta consulta. Se elige a mano desde el buzón: '
  'los dos entran con la misma cuenta del proyecto, así que no hay forma de '
  'deducirlo. Vacío = todavía no la tomó nadie.';
