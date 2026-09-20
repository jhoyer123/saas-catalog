import { createClient } from "../supabase/supabaseClient";
import { deleteFolder } from "../utils/storage";
import type { ProductFormOutput } from "@/lib/schemas/productSchema";

/**
 * action for create product
 * @param dataProducto
 * @param storeId
 * @returns
 */
export type SaveProductImagesPayload = {
  general: string[];
  bySignature: Record<string, string[]>;
};

export type SaveProductPayload = Omit<
  ProductFormOutput,
  "product_images" | "product_existing_images" | "imageToDelete" | "variants"
> & {
  variants: Omit<ProductFormOutput["variants"][number], "_removed">[];
  images: SaveProductImagesPayload;
  imageToDelete: string[];
};

export type SaveProductResult = {
  product_id: string;
  variant_id_map: Record<string, string>;
  deleted_image_urls: string[];
};

export async function saveProductFull(params: {
  storeId: string;
  productId: string;
  payload: SaveProductPayload;
}): Promise<SaveProductResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("save_product_full", {
    p_store_id: params.storeId,
    p_product_id: params.productId,
    p_payload: params.payload,
  });
  if (error) throw error;
  return data as SaveProductResult;
}

/**
 * action for delete product
 * @param id
 * @param storeId
 * @param storeSlug
 */
export async function deleteProduct(productId: string, storeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", storeId);
  if (error) throw error;

  await deleteFolder(`${storeId}/products/${productId}`);
}

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

export const toggleOfferAction = async (params: ToggleOfferParams) => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  const { error } = await supabase
    .from("products")
    .update({
      is_offer: params.is_offer,
      ...(params.is_offer && {
        offer_price: params.offer_price,
        offer_start: params.offer_start,
        offer_end: params.offer_end,
      }),
    })
    .eq("id", params.id);
  if (error) throw error;
};

/**
 * Activa o desactiva la disponibilidad de un producto
 * @param id - id del producto
 * @param is_available - true para activar, false para desactivar
 */
export const toggleAvailableAction = async (
  id: string,
  is_available: boolean,
  storeId: string,
) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_available })
    .eq("id", id)
    .eq("store_id", storeId);
  if (error) throw error;
  return { data };
};
