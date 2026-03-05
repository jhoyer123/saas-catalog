"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { generateSlug } from "@/lib/utils/slug";
import { uploadFile } from "@/lib/utils/storage";
import type {
  ProductInputService,
  ProductInputServiceUpdate,
} from "@/lib/schemas/product";
import type {
  PaginationParams,
  PaginatedResponse,
} from "@/types/pagination.types";
import type { ProductCatalog } from "@/types/product.types";
import { checkIsOfferActive } from "../helpers/validations";
import { revalidatePath } from "next/cache";

/**
 * action for create product
 * @param dataProducto
 * @param storeId
 * @returns
 */
export const createProduct = async (
  dataProducto: ProductInputService,
  storeId: string,
) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("products")
    .insert({
      sku: dataProducto.sku,
      name: dataProducto.name,
      slug: generateSlug(dataProducto.name),
      price: dataProducto.price,
      description: dataProducto.description,
      brand: dataProducto.brand,
      category_id: dataProducto.category_id,
      store_id: storeId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("name")) {
        throw new Error("Ya existe un producto con este nombre");
      }
      if (error.message.includes("sku")) {
        throw new Error("Ya existe un producto con este codigo");
      }
      if (error.message.includes("slug")) {
        throw new Error("Ya existe un producto con este slug");
      }
    }
    if (error.code === "P0001") {
      throw new Error(error.message);
    }
    throw new Error("Error al crear el producto");
  }

  for (let i = 0; i < dataProducto.images.length; i++) {
    const file = dataProducto.images[i];

    // Subir archivo
    const urlImage = await uploadFile("products", storeId, data.id, file);

    // Guardar URL en la base de datos
    const insert = await supabase.from("product_images").insert({
      product_id: data.id,
      image_url: urlImage,
    });

    if (insert.error) {
      throw new Error(insert.error.message);
    }
  }

  return data;
};

/**
 * action for update product
 * @param id
 * @param dataProducto
 * @param storeId
 * @returns
 */
export const updateProduct = async (
  id: string,
  dataProducto: ProductInputServiceUpdate,
  storeId: string,
) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  //Actualizar datos del producto
  const { data, error } = await supabase
    .from("products")
    .update({
      sku: dataProducto.sku,
      name: dataProducto.name,
      price: dataProducto.price,
      slug: generateSlug(dataProducto.name),
      description: dataProducto.description,
      brand: dataProducto.brand,
      category_id: dataProducto.category_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  //Eliminar imágenes marcadas
  if (dataProducto.imageToDelete?.length! > 0) {
    //Eliminar registros en DB
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .in("image_url", dataProducto.imageToDelete!);

    if (dbError) throw new Error(dbError.message);

    //Eliminar archivos del bucket
    const paths = dataProducto.imageToDelete!.map((url: string) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/products/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("products")
      .remove(paths);

    if (storageError) throw new Error(storageError.message);
  }

  //Subir nuevas imágenes
  if (dataProducto.images?.length) {
    for (let i = 0; i < dataProducto.images.length; i++) {
      const file = dataProducto.images[i];

      // Subir archivo
      const urlImage = await uploadFile("products", storeId, data.id, file);

      // Guardar URL en la base de datos
      const insert = await supabase.from("product_images").insert({
        product_id: data.id,
        image_url: urlImage,
      });

      if (insert.error) {
        throw new Error(insert.error.message);
      }
    }
  }

  return data;
};

/**
 * action for delete product
 * @param id
 * @param storeId
 */
export const deleteProductAction = async (
  id: string,
  storeId: string,
): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Obtener archivos antes de borrar la DB
  const folderPath = `${storeId}/${id}`;
  const { data: files } = await supabase.storage
    .from("products")
    .list(folderPath);

  // Borrar en DB (transaccionado)
  const { error } = await supabase.rpc("delete_product", {
    p_product_id: id,
  });

  if (error) throw new Error(error.message);

  // Borrar del storage
  if (files && files.length > 0) {
    const paths = files.map((f) => `${folderPath}/${f.name}`);
    await supabase.storage.from("products").remove(paths);
  }

  revalidatePath("/dashboard/panel");
};

/**
 * action for get products paginated
 * @param storeId
 * @param params
 * @returns
 */
export const getProductsPaginatedAction = async (
  storeId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<ProductCatalog>> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const {
    page = 1,
    pageSize = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "asc",
  } = params;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(name),
      images:product_images(image_url)
      `,
      { count: "exact" },
    )
    .limit(1, { foreignTable: "product_images" })
    .eq("store_id", storeId);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`,
    );
  }

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const now = new Date();

  const mapped = (data || []).map((p) => {
    const isOfferActive = checkIsOfferActive(
      {
        is_offer: p.is_offer ?? false,
        offer_price: p.offer_price ?? null,
        offer_start: p.offer_start ?? null,
        offer_end: p.offer_end ?? null,
      },
      now,
    );

    return {
      id: p.id,
      store_id: p.store_id,
      category_id: p.category_id,
      name_category: p.category?.name ?? "Sin categoría",
      name: p.name,
      sku: p.sku ?? null,
      price: p.price,
      description: p.description,
      is_available: p.is_available,
      display_order: p.display_order ?? 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
      is_offer: p.is_offer ?? false,
      offer_price: p.offer_price ?? null,
      offer_end: p.offer_end ?? null,
      offer_start: p.offer_start ?? null,
      slug: p.slug,
      brand: p.brand ?? null,
      is_offer_active: isOfferActive,
      images:
        p.images?.map((img: { image_url: string }) => img.image_url) ?? [],
    };
  });

  return {
    data: mapped,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
};

/**
 * action for get product by id
 * @param id
 * @returns
 */
export const getProductByIdAction = async (
  id: string,
): Promise<ProductCatalog> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    *,
    category:categories(name),
    images:product_images(image_url)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const mapped: ProductCatalog = {
    id: data.id,
    store_id: data.store_id,
    category_id: data.category_id,
    name_category: data.category?.name ?? "Sin categoría",
    name: data.name,
    sku: data.sku ?? null,
    price: data.price,
    description: data.description,
    is_available: data.is_available,
    display_order: data.display_order ?? 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_offer: data.is_offer ?? false,
    offer_price: data.offer_price ?? null,
    slug: data.slug,
    brand: data.brand ?? null,
    images:
      data.images?.map((img: { image_url: string }) => img.image_url) ?? [],
  };

  return mapped;
};

/**
 * Activa o desactiva la oferta de un producto
 * @param id - id del producto
 * @param is_offer - true para activar, false para desactivar
 * @param offer_price - precio de oferta (requerido si is_offer = true, null si false)
 */
export interface ToggleOfferParams {
  id: string;
  is_offer: boolean;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
}

export const toggleOfferAction = async (
  params: ToggleOfferParams,
): Promise<void> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("products")
    .update({
      is_offer: params.is_offer,
      // solo manda los campos de oferta si está activando
      ...(params.is_offer && {
        offer_price: params.offer_price,
        offer_start: params.offer_start,
        offer_end: params.offer_end,
      }),
    })
    .eq("id", params.id);

  if (error) throw new Error(error.message);
};
