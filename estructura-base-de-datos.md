-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  category_id uuid,
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  is_offer boolean NOT NULL DEFAULT false,
  offer_price numeric,
  slug text NOT NULL,
  sku text,
  offer_start timestamp with time zone,
  offer_end timestamp with time zone,
  brand_id uuid,
  has_variants boolean NOT NULL DEFAULT false,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  product_count integer DEFAULT 0,
  CONSTRAINT brands_pkey PRIMARY KEY (id),
  CONSTRAINT brands_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  product_count integer DEFAULT 0,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  max_products integer,
  price numeric,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  max_images_per_product integer NOT NULL DEFAULT 3,
  max_banners integer NOT NULL DEFAULT 3,
  sort_order integer NOT NULL DEFAULT 0,
  description text,
  max_variants_per_product integer NOT NULL DEFAULT 10,
  max_images_per_variant integer NOT NULL DEFAULT 1,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  variant_id uuid,
  visual_signature text,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  phone text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.store_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_banners_pkey PRIMARY KEY (id),
  CONSTRAINT store_banners_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.store_branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  phone text,
  lat numeric,
  lng numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_branches_pkey PRIMARY KEY (id),
  CONSTRAINT store_branches_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.store_social_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_social_links_pkey PRIMARY KEY (id),
  CONSTRAINT store_social_links_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  whatsapp_number text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  primary_color text DEFAULT '#f7f8fa'::text,
  secondary_color text DEFAULT '#000000'::text,
  plan_expires_at timestamp with time zone,
  tertiary_color text DEFAULT '#ffffff'::text,
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_plane_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id),
  CONSTRAINT stores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.store_option_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  name text NOT NULL,
  input_type text NOT NULL DEFAULT 'text'::text CHECK (input_type = ANY (ARRAY['text'::text, 'color'::text, 'image'::text, 'number'::text])),
  is_visual_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_default_on_create boolean NOT NULL DEFAULT false,
  CONSTRAINT store_option_types_pkey PRIMARY KEY (id),
  CONSTRAINT store_option_types_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.store_option_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  option_type_id uuid NOT NULL,
  value text NOT NULL,
  image_url text,
  numeric_value numeric,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  color_hexes jsonb CHECK (color_hexes IS NULL OR jsonb_typeof(color_hexes) = 'array'::text),
  unit text,
  CONSTRAINT store_option_values_pkey PRIMARY KEY (id),
  CONSTRAINT store_option_values_option_type_id_fkey FOREIGN KEY (option_type_id) REFERENCES public.store_option_types(id)
);
CREATE TABLE public.product_option_types (
  product_id uuid NOT NULL,
  option_type_id uuid NOT NULL,
  is_visual boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_option_types_pkey PRIMARY KEY (product_id, option_type_id),
  CONSTRAINT product_option_types_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_option_types_option_type_id_fkey FOREIGN KEY (option_type_id) REFERENCES public.store_option_types(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  store_id uuid NOT NULL,
  sku text,
  price numeric NOT NULL,
  offer_price numeric,
  stock integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  option_signature text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_variants_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.variant_option_values (
  variant_id uuid NOT NULL,
  option_value_id uuid NOT NULL,
  option_type_id uuid NOT NULL,
  CONSTRAINT variant_option_values_pkey PRIMARY KEY (variant_id, option_value_id),
  CONSTRAINT variant_option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id),
  CONSTRAINT variant_option_values_option_value_id_fkey FOREIGN KEY (option_value_id) REFERENCES public.store_option_values(id),
  CONSTRAINT variant_option_values_option_type_id_fkey FOREIGN KEY (option_type_id) REFERENCES public.store_option_types(id)
);