-- tests/update_variants_batch_test.sql
-- Pruebas para update_variants_batch y create_product_variants

-- =======================================================
-- Constantes de prueba
-- =======================================================
-- product/store "correctos"
\set product_id 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set store_id   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- product/store "otros"
\set other_product_id 'cccccccc-cccc-cccc-cccc-cccccccccccc'
\set other_store_id   'dddddddd-dddd-dddd-dddd-dddddddddddd'

-- Variants IDs
\set v1 '11111111-1111-1111-1111-111111111111'
\set v2 '22222222-2222-2222-2222-222222222222'
\set v3 '33333333-3333-3333-3333-333333333333'
\set v_other '44444444-4444-4444-4444-444444444444'
\set v_missing '55555555-5555-5555-5555-555555555555'

-- =======================================================
-- 0) Limpieza inicial / inserción de filas base
-- =======================================================
DELETE FROM public.product_variants
 WHERE id IN (:'v1'::uuid, :'v2'::uuid, :'v3'::uuid, :'v_other'::uuid, :'v_missing'::uuid)
    OR (product_id = :'product_id'::uuid AND sku = 'NEW-CREATED');

INSERT INTO public.product_variants
(id, product_id, store_id, sku, price, offer_price, stock, is_available, option_signature, created_at, updated_at)
VALUES
(:'v1'::uuid, :'product_id'::uuid, :'store_id'::uuid, 'SKU-1', 10.00, NULL, 5, true, 'sig1', now(), now()),
(:'v2'::uuid, :'product_id'::uuid, :'store_id'::uuid, 'SKU-2', 20.00, NULL, 8, true, 'sig2', now(), now()),
(:'v3'::uuid, :'product_id'::uuid, :'store_id'::uuid, 'SKU-3', 30.00, NULL, 2, true, 'sig3', now(), now()),
(:'v_other'::uuid, :'other_product_id'::uuid, :'other_store_id'::uuid, 'SKU-OTHER', 99.99, NULL, 1, true, 'sigo', now(), now());

-- Mostrar estado inicial
SELECT 'INITIAL STATE' AS note;
SELECT id, product_id, store_id, sku, price FROM public.product_variants
 WHERE id IN (:'v1'::uuid, :'v2'::uuid, :'v3'::uuid, :'v_other'::uuid)
 ORDER BY id;


-- =======================================================
-- Test 1: Caso feliz - todos los ids existen y pertenecen
-- =======================================================
SELECT '=== Test 1: Caso feliz (deben actualizarse v1,v2) ===' AS note;

SELECT * FROM public.update_variants_batch(
  :'product_id'::uuid,
  :'store_id'::uuid,
  ('[
    {"id":"'||:'v1'||'","sku":"SKU-1-UPDATED","price":"11.50"},
    {"id":"'||:'v2'||'","sku":"SKU-2-UPDATED","price":"21.00"}
  ]')::jsonb
);

-- Verificar filas actualizadas
SELECT 'AFTER TEST 1 (Deberia mostrar precios 11.50 y 21.00)' AS note;
SELECT id, sku, price FROM public.product_variants
 WHERE id IN (:'v1'::uuid, :'v2'::uuid) ORDER BY id;


-- =======================================================
-- Test 2: Caso con id inexistente -> debe fallar TODO/NADA
-- =======================================================
SELECT '=== Test 2: id inexistente (debe RAISE EXCEPTION y no hacer updates) ===' AS note;

DO $$
DECLARE
  _product uuid := :'product_id'::uuid;
  _store   uuid := :'store_id'::uuid;
  _patches jsonb := jsonb_build_array(
    jsonb_build_object('id', :'v1'::text, 'sku', 'SHOULD-NOT-APPLY', 'price', '99.99'),
    jsonb_build_object('id', :'v_missing'::text, 'sku', 'MISSING', 'price', '1.23')
  );
BEGIN
  BEGIN
    PERFORM public.update_variants_batch(_product, _store, _patches);
    RAISE NOTICE 'Unexpected success (ERROR: expected exception)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Caught expected exception: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Verificación visible (v1 debe mantener los valores del Test 1)
SELECT 'AFTER TEST 2 (v1 debe seguir con SKU-1-UPDATED, no SHOULD-NOT-APPLY)' AS note;
SELECT id, sku, price FROM public.product_variants
 WHERE id = :'v1'::uuid;


-- =======================================================
-- Test 3: Caso id que pertenece a otro producto/tienda -> falla
-- =======================================================
SELECT '=== Test 3: id de otro producto/tienda (debe fallar y no aplicar) ===' AS note;

DO $$
DECLARE
  _product uuid := :'product_id'::uuid;
  _store   uuid := :'store_id'::uuid;
  _patches jsonb := jsonb_build_array(
    jsonb_build_object('id', :'v1'::text, 'sku', 'SHOULD-NOT-APPLY-2', 'price', '55.55'),
    jsonb_build_object('id', :'v_other'::text, 'sku', 'OTHER-ROW-ATTEMPT', 'price', '77.77')
  );
BEGIN
  BEGIN
    PERFORM public.update_variants_batch(_product, _store, _patches);
    RAISE NOTICE 'Unexpected success (ERROR: expected exception due to ownership mismatch)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Caught expected exception: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Verificación visible (v1 debe seguir sin los cambios que se intentaron aplicar)
SELECT 'AFTER TEST 3 (Sin cambios aplicados)' AS note;
SELECT id, sku, price, product_id, store_id FROM public.product_variants
 WHERE id IN (:'v1'::uuid, :'v_other'::uuid) ORDER BY id;


-- =======================================================
-- Test 4: Prueba básica de create_product_variants
-- =======================================================
SELECT '=== Test 4: create_product_variants (inserta 1 variante nueva) ===' AS note;

-- Usamos un CTE para capturar el ID dinámico que retorna tu función
WITH created AS (
  SELECT variant_id FROM public.create_product_variants(
    :'product_id'::uuid, 
    :'store_id'::uuid,
    ('[{"sku":"NEW-CREATED","price":"5.00","stock":3}]')::jsonb
  )
)
SELECT 'CREATED NEW VARIANT' as note, pv.id, pv.sku, pv.price 
FROM public.product_variants pv
JOIN created c ON c.variant_id = pv.id;


-- =======================================================
-- Limpieza final total
-- =======================================================
SELECT '=== Limpiando toda la data de prueba ===' AS note;

DELETE FROM public.product_variants
 WHERE id IN (:'v1'::uuid, :'v2'::uuid, :'v3'::uuid, :'v_other'::uuid, :'v_missing'::uuid)
    OR (product_id = :'product_id'::uuid AND sku = 'NEW-CREATED');

SELECT '=== TEST FINALIZADO CON ÉXITO ===' AS note;