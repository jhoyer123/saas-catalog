-- Product/variant writes are atomic. Images are persisted in a separate step because
-- Storage uploads cannot participate in a PostgreSQL transaction.

ALTER TABLE public.product_images
  DROP COLUMN IF EXISTS option_value_id;

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS visual_signature text;

CREATE INDEX IF NOT EXISTS idx_product_images_visual_signature
  ON public.product_images (product_id, visual_signature);

CREATE OR REPLACE FUNCTION public.fn_option_signature(p_value_ids uuid[])
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT string_agg(v.option_type_id::text || ':' || v.id::text, '|' ORDER BY v.option_type_id)
  FROM public.store_option_values v
  WHERE v.id = ANY(p_value_ids);
$$;

CREATE OR REPLACE FUNCTION public.fn_visual_signature(p_value_ids uuid[])
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE WHEN cardinality(p_value_ids) = 0 THEN NULL ELSE public.fn_option_signature(p_value_ids) END;
$$;

CREATE OR REPLACE FUNCTION public.create_product_with_variants(p_payload jsonb)
RETURNS TABLE(product_id uuid, variant_ids uuid[])
LANGUAGE plpgsql
AS $$
DECLARE
  v_product jsonb := p_payload->'product';
  v_product_id uuid;
  v_store_id uuid := (v_product->>'store_id')::uuid;
  v_variant jsonb;
  v_variant_id uuid;
  v_value_ids uuid[];
  v_count integer := 0;
  v_limit integer;
  v_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  IF v_product IS NULL OR v_store_id IS NULL THEN
    RAISE EXCEPTION 'El producto y store_id son obligatorios';
  END IF;

  SELECT p.max_variants_per_product INTO v_limit
  FROM public.stores s JOIN public.plans p ON p.id = s.plan_id
  WHERE s.id = v_store_id;

  SELECT count(*) INTO v_count FROM jsonb_array_elements(COALESCE(p_payload->'variants', '[]'::jsonb));
  IF v_count > COALESCE(v_limit, 0) THEN
    RAISE EXCEPTION 'El plan permite como máximo % variantes por producto', v_limit;
  END IF;

  INSERT INTO public.products (store_id, name, slug, sku, price, description, category_id, brand_id, has_variants)
  VALUES (
    v_store_id, v_product->>'name', v_product->>'slug', NULLIF(v_product->>'sku', ''),
    COALESCE(NULLIF(v_product->>'price', '')::numeric, 0), v_product->>'description',
    NULLIF(v_product->>'category_id', '')::uuid, NULLIF(v_product->>'brand_id', '')::uuid,
    COALESCE((v_product->>'has_variants')::boolean, false)
  ) RETURNING id INTO v_product_id;

  INSERT INTO public.product_option_types (product_id, option_type_id, is_visual)
  SELECT v_product_id, (item->>'option_type_id')::uuid, COALESCE((item->>'is_visual')::boolean, false)
  FROM jsonb_array_elements(COALESCE(p_payload->'option_types', '[]'::jsonb)) item;

  FOR v_variant IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'variants', '[]'::jsonb)) LOOP
    SELECT array_agg(value_id::uuid) INTO v_value_ids
    FROM jsonb_array_elements_text(v_variant->'option_value_ids') value_id;

    IF cardinality(v_value_ids) IS NULL OR cardinality(v_value_ids) = 0 THEN
      RAISE EXCEPTION 'Cada variante debe incluir option_value_ids';
    END IF;

    INSERT INTO public.product_variants (product_id, store_id, sku, price, offer_price, stock, is_available, option_signature)
    VALUES (
      v_product_id, v_store_id, NULLIF(v_variant->>'sku', ''),
      COALESCE(NULLIF(v_variant->>'price', '')::numeric, 0), NULLIF(v_variant->>'offer_price', '')::numeric,
      COALESCE(NULLIF(v_variant->>'stock', '')::integer, 0), COALESCE((v_variant->>'is_available')::boolean, true),
      public.fn_option_signature(v_value_ids)
    ) RETURNING id INTO v_variant_id;

    INSERT INTO public.variant_option_values (variant_id, option_value_id, option_type_id)
    SELECT v_variant_id, value_row.id, value_row.option_type_id
    FROM public.store_option_values value_row WHERE value_row.id = ANY(v_value_ids);
    v_ids := array_append(v_ids, v_variant_id);
  END LOOP;

  RETURN QUERY SELECT v_product_id, v_ids;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_variants(p_variant_ids uuid[], p_visual_value_ids uuid[] DEFAULT NULL)
RETURNS TABLE(deleted_image_urls text[])
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_id uuid;
  v_signature text := public.fn_visual_signature(COALESCE(p_visual_value_ids, ARRAY[]::uuid[]));
  v_urls text[];
  v_in_use boolean;
BEGIN
  SELECT product_id INTO v_product_id FROM public.product_variants WHERE id = ANY(p_variant_ids) LIMIT 1;
  DELETE FROM public.product_variants WHERE id = ANY(p_variant_ids);

  IF v_product_id IS NULL OR v_signature IS NULL THEN
    RETURN QUERY SELECT NULL::text[];
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.variant_option_values vov ON vov.variant_id = pv.id
    JOIN public.product_option_types pot ON pot.product_id = pv.product_id
      AND pot.option_type_id = vov.option_type_id AND pot.is_visual
    WHERE pv.product_id = v_product_id
    GROUP BY pv.id
    HAVING public.fn_visual_signature(array_agg(vov.option_value_id)) = v_signature
  ) INTO v_in_use;

  IF NOT v_in_use THEN
    SELECT array_agg(image_url) INTO v_urls
    FROM public.product_images
    WHERE product_id = v_product_id AND visual_signature = v_signature;
    DELETE FROM public.product_images
    WHERE product_id = v_product_id AND visual_signature = v_signature;
  END IF;

  RETURN QUERY SELECT v_urls;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_product_with_variants(p_payload jsonb)
RETURNS TABLE(product_id uuid, variant_ids uuid[])
LANGUAGE plpgsql
AS $$
DECLARE
  v_product jsonb := p_payload->'product';
  v_product_id uuid := (v_product->>'id')::uuid;
  v_store_id uuid := (v_product->>'store_id')::uuid;
  v_existing_variants integer;
  v_new_variants integer;
  v_limit integer;
  v_variant jsonb;
  v_variant_id uuid;
  v_value_ids uuid[];
  v_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  IF v_product_id IS NULL OR v_store_id IS NULL THEN
    RAISE EXCEPTION 'product.id y product.store_id son obligatorios';
  END IF;

  SELECT count(*) INTO v_existing_variants FROM public.product_variants WHERE product_id = v_product_id;
  IF v_existing_variants > 0 AND p_payload ? 'option_types' THEN
    RAISE EXCEPTION 'No se pueden modificar los atributos cuando el producto ya tiene variantes';
  END IF;

  SELECT p.max_variants_per_product INTO v_limit
  FROM public.stores s JOIN public.plans p ON p.id = s.plan_id WHERE s.id = v_store_id;
  SELECT count(*) INTO v_new_variants FROM jsonb_array_elements(COALESCE(p_payload->'new_variants', '[]'::jsonb));
  IF v_existing_variants + v_new_variants > COALESCE(v_limit, 0) THEN
    RAISE EXCEPTION 'El plan permite como máximo % variantes por producto', v_limit;
  END IF;

  UPDATE public.products SET
    name = v_product->>'name', slug = v_product->>'slug', sku = NULLIF(v_product->>'sku', ''),
    price = COALESCE(NULLIF(v_product->>'price', '')::numeric, 0), description = v_product->>'description',
    category_id = NULLIF(v_product->>'category_id', '')::uuid, brand_id = NULLIF(v_product->>'brand_id', '')::uuid,
    has_variants = COALESCE((v_product->>'has_variants')::boolean, false), updated_at = now()
  WHERE id = v_product_id AND store_id = v_store_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;

  FOR v_variant IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'new_variants', '[]'::jsonb)) LOOP
    SELECT array_agg(value_id::uuid) INTO v_value_ids
    FROM jsonb_array_elements_text(v_variant->'option_value_ids') value_id;
    INSERT INTO public.product_variants (product_id, store_id, sku, price, offer_price, stock, is_available, option_signature)
    VALUES (v_product_id, v_store_id, NULLIF(v_variant->>'sku', ''),
      COALESCE(NULLIF(v_variant->>'price', '')::numeric, 0), NULLIF(v_variant->>'offer_price', '')::numeric,
      COALESCE(NULLIF(v_variant->>'stock', '')::integer, 0), COALESCE((v_variant->>'is_available')::boolean, true),
      public.fn_option_signature(v_value_ids)) RETURNING id INTO v_variant_id;
    INSERT INTO public.variant_option_values (variant_id, option_value_id, option_type_id)
    SELECT v_variant_id, value_row.id, value_row.option_type_id
    FROM public.store_option_values value_row WHERE value_row.id = ANY(v_value_ids);
    v_ids := array_append(v_ids, v_variant_id);
  END LOOP;

  RETURN QUERY SELECT v_product_id, v_ids;
END;
$$;
