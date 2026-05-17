import {
  ProductInputService,
  ProductInputServiceUpdate,
} from "../schemas/product";
import { createClient } from "../supabase/supabaseClient";
import { generateSlug } from "../utils/slug";
import * as Sentry from "@sentry/nextjs";

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
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("products")
    .insert({
      sku: dataProducto.sku?.trim() ? dataProducto.sku.trim() : null,
      name: dataProducto.name,
      slug: generateSlug(dataProducto.name),
      price: dataProducto.price,
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
  storeSlug: string,
  slugProd?: string, // 👈 opcional
) => {
  const supabase = await createClient();
  // ==================== NUEVO: Batch INSERT (1 INSERT con múltiples filas) ====================
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
export const updateProduct = async (
  id: string,
  slugProd: string,
  dataProducto: ProductInputServiceUpdate,
  storeSlug: string,
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
      return pathname.replace("/storage/v1/object/public/products/", "");
    });

    const { error: storageError } = await supabase.storage
      .from("products")
      .remove(paths);

    if (storageError) {
      console.error("updateProduct Storage ERROR:", storageError);
      return { error: `Error al eliminar la imagen: ${storageError.message}` };
    }
  }

  //revalidar si no hay nuevas imagenes
  /* if (!dataProducto.thereAreNewImages) {
    revalidateTag(`products-${storeSlug}`, "max");
    revalidatePath(`/public/${storeSlug}`);
    await purgeCatalogCache(storeSlug);
    if (slugProd) {
      revalidateTag(`product-${storeSlug}-${slugProd}`, "max");
      revalidatePath(`/public/${storeSlug}/${slugProd}`);
      await purgeProductDetailCache(storeSlug, slugProd);
    }
  } */
  return data;
};

/**
 * action for delete product
 * @param id
 * @param storeId
 * @param storeSlug
 */
export const deleteProductAction = async (
  id: string,
  slugProd: string,
  storeId: string,
  storeSlug: string,
) => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  // Obtener archivos antes de borrar la DB
  const folderPath = `${storeId}/${id}`;
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

  //revalidateTag(`products-${storeSlug}`, "max");
  //revalidateTag(cacheTag("products", storeSlug), "max");
  //revalidatePath(`/public/${storeSlug}`);
  //await purgeCatalogCache(storeSlug);
  //if (slugProd) {
  //revalidateTag(`product-${storeSlug}-${slugProd}`, "max");
  //revalidateTag(cacheTag(`product-${slugProd}`, storeSlug), "max");
  //revalidatePath(`/public/${storeSlug}/${slugProd}`);
  //await purgeProductDetailCache(storeSlug, slugProd);
  //}
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

  /* revalidateTag(`products-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  await purgeCatalogCache(storeSlug);
  if (slugProd) {
    revalidateTag(`product-${storeSlug}-${slugProd}`, "max");
    revalidatePath(`/public/${storeSlug}/${slugProd}`);
    await purgeProductDetailCache(storeSlug, slugProd);
  } */
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

  /* revalidateTag(`products-${storeSlug}`, "max");
  revalidatePath(`/public/${storeSlug}`);
  await purgeCatalogCache(storeSlug);

  if (slugProd) {
    revalidateTag(`product-${storeSlug}-${slugProd}`, "max");
    revalidatePath(`/public/${storeSlug}/${slugProd}`);
    await purgeProductDetailCache(storeSlug, slugProd);
  } */

  return { data };
};
