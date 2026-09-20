import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imágenes de la variante</DialogTitle>
          <DialogDescription>
            Gestión e inserción de imágenes para la variante seleccionada.
          </DialogDescription>
        </DialogHeader>

        <InputFile
          preset={IMAGE_PRESETS.variant}
          files={gallery.newFiles}
          onFilesChange={onFilesChange}
          existingUrls={gallery.existing.map((e) => e.url)}
          maxFiles={maxImages}
          maxSizeMB={25}
          onRemoveExisting={(url) => {
            const entry = gallery.existing.find((e) => e.url === url);
            if (entry) onRemoveExisting(entry);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
