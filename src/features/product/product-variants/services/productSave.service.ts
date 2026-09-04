// productSave.service.ts
// Persistencia del formulario de producto (create/edit) con variantes e imágenes.
// Capa de servicio: única que habla con Supabase (RPCs + Storage). No contiene UI.

import { createClient } from "@/lib/supabase/supabaseClient";
import { generateSlug } from "@/lib/utils/slug";
import { deleteFile, uploadMultipleFiles } from "@/lib/utils/storage";
import type { ProductFormOutput } from "@/lib/schemas/productSchema";
import type { ImagesState } from "../types/types";
import { visualSignature } from "../lib/generateCombinations";

export type SaveProductResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export interface SaveProductInput {
  mode: "create" | "edit";
  data: ProductFormOutput;
  imagesState: ImagesState;
  storeId: string;
  /** obligatorio en edit */
  productId?: string;
  visualTypeIds: string[];
  /** true si el producto ya tenía variantes persistidas (bloquea option_types en el RPC de update). */
  hadVariantRows: boolean;
}

type ImageRow = {
  product_id: string;
  image_url: string;
  visual_signature: string | null;
  variant_id: null;
};

function uniqueConstraintMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    if (error.message.includes("slug")) return "Ya existe un producto con este slug";
    if (error.message.includes("sku")) return "Ya existe un producto con este código";
    return "Ya existe un producto con este nombre";
  }
  return error.message;
}

async function uploadToFolder(
  bucket: string,
  folder: string,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];
  const { successes, errors } = await uploadMultipleFiles({ bucket, folder }, files);
  if (errors.length > 0) {
    console.error("Algunas imágenes no se subieron:", errors);
  }
  return successes.map((r) => r.path);
}

async function insertImageRows(
  productId: string,
  rows: Array<{ image_url: string; visual_signature: string | null }>,
): Promise<void> {
  if (rows.length === 0) return;
  const supabase = createClient();
  const imageRows: ImageRow[] = rows.map((r) => ({
    product_id: productId,
    image_url: r.image_url,
    visual_signature: r.visual_signature,
    variant_id: null,
  }));
  const { error } = await supabase.from("product_images").insert(imageRows);
  if (error) throw new Error(error.message);
}

/**
 * Sube las imágenes NUEVAS (galerías por firma visual) y las persiste en
 * product_images. Las imágenes existentes no se tocan aquí.
 * Las imágenes generales del producto las maneja ProductMediaSection (Zod).
 */
async function persistNewImages(
  storeId: string,
  productId: string,
  data: ProductFormOutput,
  imagesState: ImagesState,
): Promise<void> {
  const generalFolder = `${storeId}/products/${productId}`;
  const variantsFolder = `${generalFolder}/variants`;

  // imágenes generales del producto (ProductMediaSection) -> visual_signature: null
  const generalPaths = await uploadToFolder("stores", generalFolder, data.product_images);
  await insertImageRows(
    productId,
    generalPaths.map((image_url) => ({ image_url, visual_signature: null })),
  );

  // galerías por firma visual
  for (const [sig, gallery] of Object.entries(imagesState.bySignature)) {
    const paths = await uploadToFolder("stores", variantsFolder, gallery.newFiles);
    await insertImageRows(
      productId,
      paths.map((image_url) => ({ image_url, visual_signature: sig })),
    );
  }
}

/**
 * Borra filas de product_images (por url y por id) y sus archivos del bucket.
 * Cubre: imagen general removida (imageToDelete), imágenes de galería removidas
 * (deletedIds) y huérfanas (orphaned).
 */
async function deleteImages(
  urlsToDelete: string[],
  idsToDelete: string[],
): Promise<void> {
  if (urlsToDelete.length === 0 && idsToDelete.length === 0) return;
  const supabase = createClient();

  const urls = new Set(urlsToDelete);

  if (idsToDelete.length > 0) {
    const { data: rows, error } = await supabase
      .from("product_images")
      .select("id,image_url")
      .in("id", idsToDelete);
    if (error) throw new Error(error.message);
    rows?.forEach((r) => urls.add(r.image_url));

    const { error: delError } = await supabase
      .from("product_images")
      .delete()
      .in("id", idsToDelete);
    if (delError) throw new Error(delError.message);
  }

  if (urlsToDelete.length > 0) {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .in("image_url", urlsToDelete);
    if (error) throw new Error(error.message);
  }

  if (urls.size > 0) {
    try {
      await deleteFile("stores", Array.from(urls));
    } catch (e) {
      console.error("No se pudieron eliminar archivos del bucket:", e);
    }
  }
}

/**
 * Guarda un producto completo (create/edit): producto, atributos, variantes e
 * imágenes. Los borrados de variantes se agrupan por firma visual para que
 * `delete_variants` limpie cada galería una sola vez.
 */
export async function saveProductWithFormData({
  mode,
  data,
  imagesState,
  storeId,
  productId,
  visualTypeIds,
  hadVariantRows,
}: SaveProductInput): Promise<SaveProductResult> {
  const supabase = createClient();
  const productPayload = {
    name: data.name,
    slug: generateSlug(data.name),
    sku: data.sku?.trim() ? data.sku.trim() : null,
    price: data.has_variants ? null : data.price,
    description: data.description,
    category_id: data.category_id,
    brand_id: data.brand_id?.trim() ? data.brand_id : null,
    has_variants: data.has_variants,
  };

  const activeVariants = data.variants.filter((v) => !v._removed);
  const removedVariants = data.variants.filter((v) => v._removed);

  // ── CREATE ──
  if (mode === "create") {
    let createdId: string;
    if (data.has_variants) {
      const { data: rpcData, error } = await supabase.rpc(
        "create_product_with_variants",
        {
          p_payload: {
            product: { store_id: storeId, ...productPayload },
            option_types: data.option_types.map((ot) => ({
              option_type_id: ot.option_type_id,
              is_visual: ot.is_visual,
            })),
            variants: activeVariants.map((v) => ({
              sku: v.sku?.trim() ? v.sku.trim() : null,
              price: v.price,
              offer_price: v.offer_price ?? null,
              stock: 0,
              is_available: v.is_available,
              option_value_ids: v.option_values.map((ov) => ov.option_value_id),
            })),
          },
        },
      );
      if (error) return { ok: false, error: uniqueConstraintMessage(error) };
      const result = (rpcData ?? []) as { product_id: string }[];
      createdId = result[0]?.product_id;
    } else {
      const { data: inserted, error } = await supabase
        .from("products")
        .insert({ store_id: storeId, ...productPayload })
        .select("id")
        .single();
      if (error) return { ok: false, error: uniqueConstraintMessage(error) };
      createdId = inserted.id;
    }

    if (!createdId) return { ok: false, error: "No se pudo crear el producto" };

    try {
      await persistNewImages(storeId, createdId, data, imagesState);
    } catch (e) {
      return {
        ok: false,
        error: `Producto creado, pero no se pudieron guardar las imágenes: ${(e as Error).message}`,
      };
    }
    return { ok: true, id: createdId };
  }

  // ── EDIT ──
  if (!productId) return { ok: false, error: "Falta el id del producto" };

  try {
    const { error: updError } = await supabase.rpc("update_product_with_variants", {
      p_payload: {
        product: { id: productId, store_id: storeId, ...productPayload },
        ...(!hadVariantRows && {
          option_types: data.option_types.map((ot) => ({
            option_type_id: ot.option_type_id,
            is_visual: ot.is_visual,
          })),
        }),
        new_variants: activeVariants
          .filter((v) => !v.id)
          .map((v) => ({
            sku: v.sku?.trim() ? v.sku.trim() : null,
            price: v.price,
            offer_price: v.offer_price ?? null,
            stock: 0,
            is_available: v.is_available,
            option_value_ids: v.option_values.map((ov) => ov.option_value_id),
          })),
      },
    });
    if (updError) return { ok: false, error: uniqueConstraintMessage(updError) };

    // actualizar variantes existentes (precio, sku, oferta, disponibilidad)
    const editedVariants = activeVariants.filter((v) => v.id);
    if (editedVariants.length > 0) {
      const { error: batchError } = await supabase.rpc("update_variants_batch", {
        p_product_id: productId,
        p_store_id: storeId,
        p_patches: editedVariants.map((v) => ({
          id: v.id,
          sku: v.sku ?? "",
          price: v.price,
          offer_price: v.offer_price ?? null,
          is_available: v.is_available,
        })),
      });
      if (batchError) return { ok: false, error: batchError.message };
    }

    // borrar variantes removidas, agrupadas por firma visual
    if (removedVariants.length > 0) {
      const groups = new Map<string, { ids: string[]; visualValueIds: string[] }>();
      removedVariants.forEach((v) => {
        const sig = visualSignature(v.option_values, visualTypeIds) ?? "__general__";
        const group = groups.get(sig) ?? { ids: [], visualValueIds: [] };
        group.ids.push(v.id as string);
        group.visualValueIds = v.option_values
          .filter((ov) => visualTypeIds.includes(ov.option_type_id))
          .map((ov) => ov.option_value_id);
        groups.set(sig, group);
      });

      for (const group of groups.values()) {
        const { data: rpcData, error } = await supabase.rpc("delete_variants", {
          p_variant_ids: group.ids,
          p_visual_value_ids: group.visualValueIds.length > 0 ? group.visualValueIds : null,
        });
        if (error) return { ok: false, error: error.message };
        const urls = (rpcData?.[0]?.deleted_image_urls ?? []).filter(Boolean) as string[];
        if (urls.length > 0) {
          try {
            await deleteFile("stores", urls);
          } catch (e) {
            console.error("No se pudieron eliminar imágenes de variantes:", e);
          }
        }
      }
    }

    // borrar imágenes marcadas + persistir las nuevas
    await deleteImages(data.imageToDelete ?? [], [
      ...imagesState.deletedIds,
      ...imagesState.orphaned.flatMap((o) => o.ids),
    ]);
    await persistNewImages(storeId, productId, data, imagesState);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  return { ok: true, id: productId };
}
