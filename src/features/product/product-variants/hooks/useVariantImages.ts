import { useState, useCallback } from "react";
import {
  ImagesState,
  ImageEntry,
  NO_VISUAL_KEY,
  emptyGallery,
} from "../types/types";
import {
  updateGallery,
  clearNewVariantImages,
  resetVariantImages,
  pruneOrphanedGalleries,
  regroupBySignature,
} from "../lib/variantImages";
import type { ComboValue } from "../lib/generateCombinations";

export function useVariantImages(initial?: Partial<ImagesState>) {
  const [state, setState] = useState<ImagesState>({
    general: initial?.general ?? emptyGallery(),
    bySignature: initial?.bySignature ?? {},
    orphaned: initial?.orphaned ?? [],
    deletedIds: initial?.deletedIds ?? [],
  });

  const addFiles = useCallback((sigKey: string, files: File[]) => {
    setState((s) =>
      updateGallery(s, sigKey, (g) => ({
        ...g,
        newFiles: [...g.newFiles, ...files],
      })),
    );
  }, []);

  const removeNewFile = useCallback((sigKey: string, index: number) => {
    setState((s) =>
      updateGallery(s, sigKey, (g) => ({
        ...g,
        newFiles: g.newFiles.filter((_, i) => i !== index),
      })),
    );
  }, []);

  const removeExisting = useCallback((sigKey: string, entry: ImageEntry) => {
    setState((s) => {
      // MODIFICADO: deletedIds ya no vive dentro de la galería, es plano a
      // nivel de ImagesState. Se actualizan ambas cosas en un solo setState
      // para no perder la referencia previa de deletedIds (mismo problema
      // que resolvimos en ProductMediaSection: leer el valor actual, no una
      // copia vieja).
      const withoutEntry = updateGallery(s, sigKey, (g) => ({
        ...g,
        existing: g.existing.filter((e) => e.url !== entry.url),
      }));
      return {
        ...withoutEntry,
        deletedIds: [...s.deletedIds, ...entry.ids],
      };
    });
  }, []);

  const pruneOrphaned = useCallback((activeSignatures: Set<string>) => {
    setState((s) => pruneOrphanedGalleries(s, activeSignatures));
  }, []);

  const setNewFiles = useCallback((sigKey: string, files: File[]) => {
    setState((s) =>
      updateGallery(s, sigKey, (g) => ({ ...g, newFiles: files })),
    );
  }, []);

  const resetNewFiles = useCallback(() => {
    setState(clearNewVariantImages);
  }, []);

  const reset = useCallback(() => {
    setState(resetVariantImages);
  }, []);

  const regroup = useCallback(
    (variants: { id?: string; option_values: ComboValue[] }[], visualTypeIds: string[]) => {
      setState((s) => regroupBySignature(s, variants, visualTypeIds));
    },
    [],
  );

  return {
    state,
    addFiles,
    removeNewFile,
    removeExisting,
    pruneOrphaned,
    setNewFiles,
    resetNewFiles,
    reset,
    regroup,
    NO_VISUAL_KEY,
  };
}
