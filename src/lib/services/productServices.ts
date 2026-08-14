import {
  ProductInputService,
  ProductInputServiceUpdate,
} from "../schemas/product";
import { createClient } from "../supabase/supabaseClient";
import { generateSlug } from "../utils/slug";
import * as Sentry from "@sentry/nextjs";
import { deleteFile, deleteFolder } from "../utils/storage";
import type { ProductVariantDraft } from "@/features/product/product-variants/types/types";

/**
 * action for create product
 * @param dataProducto
 * @param storeId
 * @returns
 */
export const createProduct = async (
  dataProducto: ProductInputService,
  storeId: string,
  variantDraft?: ProductVariantDraft,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  if (dataProducto.has_variants) {
    if (!variantDraft || variantDraft.optionTypes.length === 0 || variantDraft.variants.length === 0) {
      return { error: "Configura al menos un atributo, valor y variante antes de guardar." };
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("create_product_with_variants", {
      p_payload: {
        product: {
          store_id: storeId,
          name: dataProducto.name,
          slug: generateSlug(dataProducto.name),
          sku: dataProducto.sku ?? null,
          price: dataProducto.price,
          description: dataProducto.description,
          category_id: dataProducto.category_id,
          brand_id: dataProducto.brand_id ?? null,
          has_variants: true,
        },
        option_types: variantDraft.optionTypes.map((optionType) => ({ option_type_id: optionType.optionTypeId, is_visual: optionType.isVisual })),
        variants: variantDraft.variants.map((variant) => ({ sku: variant.sku, price: variant.price, offer_price: variant.offerPrice, stock: variant.stock, is_available: variant.isAvailable, option_value_ids: variant.optionValueIds })),
      },
    });

    if (rpcError) return { error: rpcError.message };
    const result = (rpcData ?? []) as { product_id: string }[];
    if (!result[0]?.product_id) return { error: "El RPC no devolvió el producto creado." };
    return { id: result[0].product_id };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      sku: dataProducto.sku?.trim() ? dataProducto.sku.trim() : null,
      name: dataProducto.name,
      slug: generateSlug(dataProducto.name),
      price: dataProducto.price,
      has_variants: dataProducto.has_variants ?? false,
      description: dataProducto.description,
      brand_id: dataProducto.brand_id ?? null,
      category_id: dataProducto.category_id,
      store_id: storeId,
    })
    .select()
    .single();

  if (error) {
    if (error.code !== "23505" && error.code !== "P0001") {
      Sentry.captureException(error, {
        extra: { storeId, productName: dataProducto.name },
      });
    }
    if (error.code === "23505") {
      if (error.message.includes("name")) {
        console.error("createProduct DB ERROR:", error);
        return { error: "Ya existe un producto con este nombre" };
      }
      if (error.message.includes("sku")) {
        console.error("createProduct DB ERROR:", error);
        return { error: "Ya existe un producto con este codigo" };
      }
      if (error.message.includes("slug")) {
        console.error("createProduct DB ERROR:", error);
        return { error: "Ya existe un producto con este slug" };
      }
    }
    if (error.code === "P0001") {
      console.error("createProduct DB ERROR:", error);
      return { error: error.message };
    }
    console.error("createProduct DB ERROR:", error);
    return { error: "Error al crear el producto" };
  }

  return data;
};

export const saveProductImages = async (
  productId: string,
  imageUrls: string[],
) => {
  const supabase = await createClient();
  // En lugar de N INSERTs secuenciales, hacemos 1 INSERT con todo
  // Esto reduce latencia de red de N round-trips a 1 round-trip
  const imageRecords = imageUrls.map((url) => ({
    product_id: productId,
    image_url: url,
  }));

  const { error } = await supabase.from("product_images").insert(imageRecords);

  if (error) {
    // Capturamos el error de todo el batch
    Sentry.captureException(error, {
      extra: {
        productId,
        imageCount: imageRecords.length,
        failedUrls: imageUrls,
      },
    });
    console.error("Error al guardar imágenes (batch):", error);
    return { error: error.message };
  }

  return { success: true };
};

/**
 * action for update product
 * @param id
 * @param dataProducto
 * @param storeId
 * @returns
 */
/* export const updateProduct = async (
  id: string,
  dataProducto: ProductInputServiceUpdate,
) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  //Actualizar datos del producto
  const { data, error } = await supabase
    .from("products")
    .update({
      sku: dataProducto.sku?.trim() ? dataProducto.sku.trim() : null,
      name: dataProducto.name,
      price: dataProducto.price,
      has_variants: dataProducto.has_variants ?? false,
      slug: generateSlug(dataProducto.name),
      description: dataProducto.description,
      brand_id: dataProducto.brand_id ?? null,
      category_id: dataProducto.category_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("name")) {
        console.error("updateProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este nombre",
        };
      }
      if (error.message.includes("sku")) {
        console.error("updateProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este codigo",
        };
      }

      if (error.message.includes("slug")) {
        console.error("updateProduct DB ERROR", error);
        return {
          error: "Ya existe un producto con este slug",
        };
      }
    }
    if (error.code === "P0001") {
      console.error("updateProduct DB ERROR:", error);
      return { error: error.message };
    }
    console.error("updateProduct DB ERROR:", error);
    return { error: "Error al actualizar el producto" };
  }

  //Eliminar imágenes marcadas
  if (dataProducto.imageToDelete?.length! > 0) {
    //Eliminar registros en DB
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .in("image_url", dataProducto.imageToDelete!);

    if (dbError) {
      console.error("updateProduct DB ERROR:", dbError);
      return { error: "Error al eliminar las imágenes del producto" };
    }

    //Eliminar archivos del bucket
    const paths = dataProducto.imageToDelete!.map((url: string) => {
      const pathname = new URL(url).pathname;
      return pathname.replace("/storage/v1/object/public/stores/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("stores")
      .remove(paths);

    if (storageError) {
      console.error("updateProduct Storage ERROR:", storageError);
      return { error: `Error al eliminar la imagen: ${storageError.message}` };
    }
  }
  return data;
}; */
export const updateProduct = async (
  id: string,
  dataProducto: ProductInputServiceUpdate,
) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  //Actualizar datos del producto
  const { data, error } = await supabase
    .from("products")
    .update({
      sku: dataProducto.sku?.trim() ? dataProducto.sku.trim() : null,
      name: dataProducto.name,
      price: dataProducto.price,
      slug: generateSlug(dataProducto.name),
      description: dataProducto.description,
      brand_id: dataProducto.brand_id ?? null,
      category_id: dataProducto.category_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("name")) {
        console.error("updateProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este nombre",
        };
      }
      if (error.message.includes("sku")) {
        console.error("updateProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este codigo",
        };
      }

      if (error.message.includes("slug")) {
        console.error("updateProduct DB ERROR", error);
        return {
          error: "Ya existe un producto con este slug",
        };
      }
    }
    if (error.code === "P0001") {
      console.error("updateProduct DB ERROR:", error);
      return { error: error.message };
    }
    console.error("updateProduct DB ERROR:", error);
    return { error: "Error al actualizar el producto" };
  }

  //Eliminar imágenes marcadas
  if (dataProducto.imageToDelete?.length! > 0) {
    //Eliminar registros en DB
    // imageToDelete contiene paths relativos (los mismos que se guardan en image_url)
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .in("image_url", dataProducto.imageToDelete!);

    if (dbError) {
      console.error("updateProduct DB ERROR:", dbError);
      return { error: "Error al eliminar las imágenes del producto" };
    }

    //Eliminar archivos del bucket
    try {
      await deleteFile("stores", dataProducto.imageToDelete!);
    } catch (error) {
      console.error("No se pudo eliminar la imagen antigua:", error);
    }
  }

  return data;
};

/**
 * action for delete product
 * @param id
 * @param storeId
 * @param storeSlug
 */
/* export const deleteProductAction = async (id: string, storeId: string) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // Obtener archivos antes de borrar la DB
  const folderPath = `${storeId}/products/${id}`;
  const { data: files } = await supabase.storage
    .from("products")
    .list(folderPath);

  // Borrar en DB (transaccionado)
  const { error } = await supabase.rpc("delete_product", {
    p_product_id: id,
  });

  if (error) {
    console.error("deleteProductAction DB ERROR:", error);
    return { error: "Error al eliminar el producto" };
  }

  // Borrar del storage
  if (files && files.length > 0) {
    const paths = files.map((f) => `${folderPath}/${f.name}`);
    await supabase.storage.from("products").remove(paths);
  }
}; */
export const deleteProductAction = async (id: string, storeId: string) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // Borrar en DB (transaccionado)
  const { error } = await supabase.rpc("delete_product", {
    p_product_id: id,
  });

  if (error) {
    console.error("deleteProductAction DB ERROR:", error);
    return { error: "Error al eliminar el producto" };
  }

  // Borrar del storage (incluye subcarpetas)
  const folderPath = `${storeId}/products/${id}`;

  try {
    await deleteFolder("stores", folderPath);
  } catch (storageError) {
    console.error("deleteProductAction Storage ERROR:", storageError);
    // No romper el flujo
  }
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
  slugProd: string,
  params: ToggleOfferParams,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

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

  if (error) {
    console.error("toggleOfferAction DB ERROR:", error);
    return { error: "Error al actualizar la oferta del producto" };
  }
};

/**
 * Activa o desactiva la disponibilidad de un producto
 * @param id - id del producto
 * @param is_available - true para activar, false para desactivar
 */
export const toggleAvailableAction = async (
  id: string,
  slugProd: string,
  is_available: boolean,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .update({ is_available })
    .eq("id", id)
    .eq("store_id", storeId);

  if (error) {
    console.error("toggleAvailableAction DB ERROR:", error);
    return { error: "Error al actualizar la disponibilidad del producto" };
  }

  return { data };
};
