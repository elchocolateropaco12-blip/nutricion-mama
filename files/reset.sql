-- ═══════════════════════════════════════════════════════════════════
--  LIMPIEZA PREVIA A PRODUCCIÓN
--  Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql.
--  Borra datos. No hay papelera. Léelo entero antes de darle a Run.
-- ═══════════════════════════════════════════════════════════════════

-- ── Paso 1: mirar qué hay antes de borrar nada
select
  log_date,
  count(*)                                as comidas,
  count(*) filter (where source = 'photo') as por_foto,
  count(*) filter (where fat_warning)      as sobre_limite_grasa
from public.meal_entries
group by log_date
order by log_date desc;

-- ── Paso 2A: BORRADO TOTAL (arrancar de cero)
--  El orden importa: primero los resúmenes, que dependen de las comidas.
begin;
  delete from public.daily_summaries;
  delete from public.meal_entries;
commit;

-- ── Paso 2B: alternativa, borrar SOLO lo anterior a una fecha
--  Descomenta esto y comenta el bloque 2A si quieres conservar histórico.
-- begin;
--   delete from public.daily_summaries where log_date < '2026-08-08';
--   delete from public.meal_entries    where log_date < '2026-08-08';
-- commit;

-- ── Paso 3: las fotos de prueba viven en Storage, no en estas tablas.
--  El SQL no las borra. Ve a Storage → meal-photos y vacía las carpetas
--  a mano, o ejecuta esto (irreversible):
-- delete from storage.objects where bucket_id = 'meal-photos';

-- ── Paso 4: comprobar que quedó limpio. Las dos filas deben dar 0.
select 'meal_entries' as tabla, count(*) from public.meal_entries
union all
select 'daily_summaries', count(*) from public.daily_summaries;

-- ── Paso 5: confirmar que el usuario existe y copiar su UUID a DEFAULT_USER_ID
select id as copiar_a_DEFAULT_USER_ID, email, created_at
from auth.users
order by created_at;
