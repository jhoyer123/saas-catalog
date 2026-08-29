import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
  readOnly = false,
}: {
  optionValues: ComboValue[];
  visualTypeIds: string[];
  imagesBySignature: ImagesState["bySignature"];
  generalGallery: GalleryState;
  onOpenImagePicker: (sigKey: string) => void;
  readOnly?: boolean;
}) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const sig = visualSignature(optionValues, visualTypeIds);
  const sigKey = sig ?? NO_VISUAL_KEY;
  const gallery = sig
    ? (imagesBySignature[sig] ?? emptyGallery())
    : generalGallery;

  const firstExistingUrl = gallery.existing[0]?.url;
  const firstNewFile =
    gallery.existing.length === 0 ? gallery.newFiles[0] : undefined;

  useEffect(() => {
    if (!firstNewFile) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(firstNewFile);
    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [firstNewFile]);

  const thumbUrl = firstExistingUrl
    ? getCatalogImageUrl(firstExistingUrl)
    : localPreviewUrl;

  const total = gallery.existing.length + gallery.newFiles.length;
  const needsImage = total === 0;

  return (
    <button
      type="button"
      onClick={() => {
        if (!readOnly) {
          onOpenImagePicker(sigKey);
        }
      }}
      disabled={readOnly}
      className={`
        relative flex h-12 w-12 shrink-0 items-center justify-center
        overflow-hidden rounded-md border bg-muted
        ${readOnly ? "cursor-default opacity-90" : "cursor-pointer"}
      `}
    >
      {thumbUrl ? (
        <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      )}

      {total > 1 && (
        <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[10px] text-white">
          +{total - 1}
        </span>
      )}

      {needsImage && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
      )}
    </button>
  );
}
