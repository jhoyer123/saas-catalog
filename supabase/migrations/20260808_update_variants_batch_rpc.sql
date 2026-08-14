-- Migration: update_variants_batch RPC
-- Updates multiple product_variants in a single transactional function (pure UPDATE, no upsert)
CREATE OR REPLACE FUNCTION public.update_variants_batch(
  p_product_id uuid,
  p_store_id uuid,
  p_patches jsonb
) RETURNS TABLE(updated_variant_id uuid) LANGUAGE plpgsql AS $$
DECLARE
  patch jsonb;
  rec product_variants%ROWTYPE;
  ids uuid[];
  matched integer;
  missing_ids text;
BEGIN
  IF p_patches IS NULL THEN
    RETURN;
  END IF;

  -- Extract ids from patches
  SELECT array_agg((elem->>'id')::uuid) INTO ids FROM jsonb_array_elements(p_patches) AS elem;

  IF ids IS NULL OR array_length(ids,1) = 0 THEN
    RETURN;
  END IF;

  -- Validate that all ids exist and belong to the given product and store
  SELECT count(*) INTO matched
  FROM public.product_variants
  WHERE id = ANY(ids)
    AND product_id = p_product_id
    AND store_id = p_store_id;

  IF matched <> coalesce(array_length(ids,1),0) THEN
    SELECT string_agg(missing::text, ',') INTO missing_ids
    FROM (
      SELECT id FROM unnest(ids) id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.product_variants pv WHERE pv.id = id AND pv.product_id = p_product_id AND pv.store_id = p_store_id
      )
    ) t(missing);

    RAISE EXCEPTION 'Ids inválidos o de otro producto/tienda: %', coalesce(missing_ids,'(sin detalle)');
  END IF;

  FOR patch IN SELECT * FROM jsonb_array_elements(p_patches)
  LOOP
    -- Update only rows that match product_id and store_id for extra safety
    UPDATE public.product_variants
    SET
      sku = COALESCE(NULLIF(patch->>'sku',''), sku),
      price = COALESCE(NULLIF(patch->>'price','')::numeric, price),
      offer_price = CASE WHEN patch ? 'offer_price' THEN NULLIF(patch->>'offer_price','')::numeric ELSE offer_price END,
      stock = COALESCE((patch->>'stock')::int, stock),
      is_available = COALESCE((patch->>'is_available')::boolean, is_available),
      updated_at = now()
    WHERE id = (patch->>'id')::uuid
      AND product_id = p_product_id
      AND store_id = p_store_id
    RETURNING * INTO rec;

    IF FOUND THEN
      RETURN NEXT rec.id;
    END IF;
  END LOOP;
END;
$$;
