import { ImageIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  visualSignature,
  type ComboValue,
} from "@/features/product/product-variants/lib/generateCombinations";
import {
  emptyGallery,
  GalleryState,
  ImagesState,
  NO_VISUAL_KEY,
} from "@/features/product/product-variants/types/types";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

export function VariantImageCell({
  optionValues,
  visualTypeIds,
  imagesBySignature,
  generalGallery,
  onOpenImagePicker,
}: {
  optionValues: ComboValue[];
  visualTypeIds: string[];
  imagesBySignature: ImagesState["bySignature"];
  generalGallery: GalleryState;
  onOpenImagePicker: (sigKey: string) => void;
}) {
  const sig = visualSignature(optionValues, visualTypeIds);
  const sigKey = sig ?? NO_VISUAL_KEY;
  const gallery = sig
    ? (imagesBySignature[sig] ?? emptyGallery())
    : generalGallery;

  const firstExistingUrl = gallery.existing[0]?.url;
  const firstNewFile =
    gallery.existing.length === 0 ? gallery.newFiles[0] : undefined;

  // objectURL solo se recalcula si cambia el File en sí (por referencia)
  const localPreviewUrl = useMemo(
    () => (firstNewFile ? URL.createObjectURL(firstNewFile) : null),
    [firstNewFile],
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const thumbUrl = firstExistingUrl
    ? getCatalogImageUrl(firstExistingUrl)
    : localPreviewUrl;

  const total = gallery.existing.length + gallery.newFiles.length;
  // MODIFICADO: antes era `sig !== null && total === 0`, así que cuando NO
  // hay ningún atributo visual (sig siempre null para todas las variantes),
  // el punto rojo de "falta imagen" nunca se mostraba -- pero
  // FormProduct.handleSubmit SÍ exige imagen para ese grupo compartido
  // (general) cuando has_variants es true. Resultado: el usuario no veía
  // ninguna advertencia en la tabla y recién se enteraba al tocar "Guardar",
  // sin pista de dónde corregirlo. Ahora el aviso es consistente con lo que
  // realmente se valida en el submit.
  const needsImage = total === 0;

  return (
    <button
      type="button"
      onClick={() => onOpenImagePicker(sigKey)}
      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center"
    >
      {thumbUrl ? (
        <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      )}
      {total > 1 && (
        <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
          +{total - 1}
        </span>
      )}
      {needsImage && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
      )}
    </button>
  );
}
