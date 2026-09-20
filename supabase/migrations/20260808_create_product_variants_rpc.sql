-- Migration: create_product_variants RPC
-- Creates function to insert many product_variants and their variant_option_values in one transaction
CREATE OR REPLACE FUNCTION public.create_product_variants(
  p_product_id uuid,
  p_store_id uuid,
  p_combinations jsonb
) RETURNS TABLE(variant_id uuid) LANGUAGE plpgsql AS $$
DECLARE
  combo jsonb;
  ov jsonb;
  v_id uuid;
BEGIN
  IF p_combinations IS NULL THEN
    RETURN;
  END IF;

  FOR combo IN SELECT * FROM jsonb_array_elements(p_combinations)
  LOOP
    -- Insert variant row
    INSERT INTO public.product_variants(
      product_id, store_id, sku, price, offer_price, stock, is_available, option_signature, created_at, updated_at
    ) VALUES (
      p_product_id,
      p_store_id,
      (combo->>'sku')::text,
      COALESCE(NULLIF(combo->>'price','')::numeric, 0),
      NULLIF(combo->>'offer_price','')::numeric,
      COALESCE(NULLIF(combo->>'stock','')::int, 0),
      COALESCE((combo->>'is_available')::boolean, true),
      (CASE WHEN combo ? 'option_signature' THEN combo->>'option_signature'
            WHEN combo ? 'combination' AND (combo->'combination') ? 'signature' THEN (combo->'combination'->>'signature')
            ELSE NULL END),
      now(), now()
    ) RETURNING id INTO v_id;

    -- Insert associated option values. Support two possible input shapes:
    -- 1) combo contains "option_values": [{ option_type_id, option_value_id }, ...]
    -- 2) combo contains "combination": { values: [{ optionTypeId, optionValueId }, ...], signature }
    IF combo ? 'option_values' THEN
      FOR ov IN SELECT * FROM jsonb_array_elements(combo->'option_values')
      LOOP
        INSERT INTO public.variant_option_values(variant_id, option_value_id, option_type_id)
        VALUES (v_id, (ov->>'option_value_id')::uuid, (ov->>'option_type_id')::uuid);
      END LOOP;
    ELSIF combo ? 'combination' THEN
      IF (combo->'combination') ? 'values' THEN
        FOR ov IN SELECT * FROM jsonb_array_elements(combo->'combination'->'values')
        LOOP
          INSERT INTO public.variant_option_values(variant_id, option_value_id, option_type_id)
          VALUES (v_id, (ov->>'optionValueId')::uuid, (ov->>'optionTypeId')::uuid);
        END LOOP;
      END IF;
    END IF;

    RETURN NEXT v_id;
  END LOOP;
END;
$$;
