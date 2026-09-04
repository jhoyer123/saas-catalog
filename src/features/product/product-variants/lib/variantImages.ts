import {
  ImagesState,
  GalleryState,
  emptyGallery,
  ImageEntry,
} from "../types/types";
import { ComboValue, visualSignature } from "./generateCombinations";

/** Devuelve el ImagesState nuevo aplicando `fn` a la galería de sigKey */
export function updateGallery(
  state: ImagesState,
  sigKey: string,
  fn: (g: GalleryState) => GalleryState,
): ImagesState {
  const current = state.bySignature[sigKey] ?? emptyGallery();
  return {
    ...state,
    bySignature: { ...state.bySignature, [sigKey]: fn(current) },
  };
}

/**
 * Discards local uploads after the visual-attribute configuration changes.
 * Existing images and pending deletions are retained because they are already
 * persisted and must not be modified by this client-side reset.
 */
export function clearNewVariantImages(state: ImagesState): ImagesState {
  return {
    ...state,
    bySignature: Object.fromEntries(
      Object.entries(state.bySignature).map(([signature, gallery]) => [
        signature,
        { ...gallery, newFiles: [] },
      ]),
    ),
  };
}

/** Clears every client-side gallery when variant mode is restarted. */
export function resetVariantImages(state: ImagesState): ImagesState {
  return {
    bySignature: {},
    orphaned: [],
    deletedIds: state.deletedIds,
  };
}

/**
 * Elimina galerías cuya firma ya no está activa (el valor que la generaba se
 * destildó del todo). Sus imágenes existentes se marcan para borrar: a
 * diferencia de una ambigüedad de regroup, acá no hay a dónde reasignarlas
 * -> van directo a deletedIds, no a `orphaned`.
 */
export function pruneOrphanedGalleries(
  state: ImagesState,
  activeSignatures: Set<string>,
): ImagesState {
  const next: ImagesState["bySignature"] = {};
  let idsToDelete: string[] = [];

  for (const [sig, gallery] of Object.entries(state.bySignature)) {
    if (activeSignatures.has(sig)) {
      next[sig] = gallery;
    } else {
      idsToDelete = [...idsToDelete, ...gallery.existing.flatMap((e) => e.ids)];
    }
  }

  return {
    ...state,
    bySignature: next,
    deletedIds: [...state.deletedIds, ...idsToDelete],
  };
}

export function regroupBySignature(
  state: ImagesState,
  variants: { id?: string; option_values: ComboValue[] }[],
  visualTypeIds: string[],
): ImagesState {
  // 1. aplanar TODAS las imágenes existentes, incluyendo las que ya estaban
  //    huérfanas (un regroup nuevo puede encontrarles hogar de nuevo)
  const allExisting: ImageEntry[] = [
    ...Object.values(state.bySignature).flatMap((g) => g.existing),
    ...state.orphaned,
  ];

  // 2. variantId -> nueva firma, usando visualTypeIds actualizado.
  //    undefined = la variante ya no existe (fue borrada).
  //    null = existe, pero no tiene atributo visual (no debería pasar si hay visualTypeIds).
  //    string = firma visual concreta.
  const variantToNewSig = new Map<string, string | null>();
  variants.forEach((v) => {
    if (v.id)
      variantToNewSig.set(
        v.id,
        visualSignature(v.option_values, visualTypeIds),
      );
  });

  const nextBySignature: ImagesState["bySignature"] = {};
  const nextOrphaned: ImageEntry[] = [];

  allExisting.forEach((entry) => {
    if (entry.variantIds.length === 0) {
      nextOrphaned.push(entry);
      return;
    }

    const resolved = entry.variantIds.map((vid) => variantToNewSig.get(vid));

    // alguna de sus variantes fue borrada -> ya no tiene dueño válido
    if (resolved.some((s) => s === undefined)) {
      nextOrphaned.push(entry);
      return;
    }

    const uniqueSigs = new Set(resolved as (string | null)[]);

    // sus variantes ahora caen en firmas distintas entre sí -> ambigüedad real
    if (uniqueSigs.size > 1) {
      nextOrphaned.push(entry);
      return;
    }

    const sig = [...uniqueSigs][0];
    if (sig === null) {
      // Sin atributos visuales: las imágenes van al producto general (Zod), no aquí.
      // Las marcamos como huérfanas para que el usuario decida.
      nextOrphaned.push(entry);
    } else {
      (nextBySignature[sig] ??= emptyGallery()).existing.push(entry);
    }
  });

  // 3. newFiles no tienen variantId (aún no persistidos) -> no se pueden
  //    reagrupar con certeza. Se descartan con aviso (toast en FormProduct):
  //    el usuario debe volver a subirlos bajo la nueva agrupación.
  return {
    bySignature: nextBySignature,
    orphaned: nextOrphaned,
    deletedIds: state.deletedIds, // se preserva tal cual, el regroup no borra nada
  };
}
