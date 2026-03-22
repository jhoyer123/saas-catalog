"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { generateSlug } from "@/lib/utils/slug";
import { uploadFile } from "@/lib/utils/storage";
import type {
  ProductInputService,
  ProductInputServiceUpdate,
} from "@/lib/schemas/product";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * action for create product
 * @param dataProducto
 * @param storeId
 * @returns
 */
export const createProduct = async (
  dataProducto: ProductInputService,
  storeId: string,
  storeSlug: string,
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
    if (error.code === "23505") {
      if (error.message.includes("name")) {
        console.error("createProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este nombre",
        };
      }
      if (error.message.includes("sku")) {
        console.error("createProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este codigo",
        };
      }

      if (error.message.includes("slug")) {
        console.error("createProduct DB ERROR:", error);
        return {
          error: "Ya existe un producto con este slug",
        };
      }
    }
    if (error.code === "P0001") {
      console.error("createProduct DB ERROR:", error);
      return { error: error.message };
    }
    console.error("createProduct DB ERROR:", error);
    return { error: "Error al crear el producto" };
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
      console.error("Error al subir la imagen:", insert.error);
      return {
        error: `Error al subir la imagen: ${insert.error.message}`,
      };
    }
  }

  revalidateTag(`products-${storeSlug}`, "max");
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
        console.error(
          "updateProduct Storage ERROR error al subir la imagen:",
          insert.error,
        );
        return { error: "Error al subir la imagen: " + i };
      }
    }
  }

  revalidateTag(`products-${storeSlug}`, "max");
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

  revalidateTag(`products-${storeSlug}`, "max");
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

  revalidateTag(`products-${storeSlug}`, "max");
};
