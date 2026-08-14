import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputFile, { IMAGE_PRESETS } from "@/components/shared/InputFile";
import type { GalleryState, ImageEntry } from "../types/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: GalleryState;
  maxImages: number;
  onFilesChange: (files: File[]) => void; // ahora recibe la lista FINAL, no un delta
  onRemoveExisting: (entry: ImageEntry) => void;
}

export function VariantGalleryDialog({
  open,
  onOpenChange,
  gallery,
  maxImages,
  onFilesChange,
  onRemoveExisting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Imágenes de la combinación</DialogTitle>
        </DialogHeader>
        {/* MODIFICADO: InputFile ya no usa value/onChange con FileList ni
            imgExisting -- ahora es files/onFilesChange (File[] directo,
            sin pasar por createFileListFromArray) + existingUrls + preset. */}
        <InputFile
          preset={IMAGE_PRESETS.product}
          files={gallery.newFiles}
          onFilesChange={onFilesChange}
          existingUrls={gallery.existing.map((e) => e.url)}
          maxFiles={maxImages}
          onRemoveExisting={(url) => {
            const entry = gallery.existing.find((e) => e.url === url);
            if (entry) onRemoveExisting(entry);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
