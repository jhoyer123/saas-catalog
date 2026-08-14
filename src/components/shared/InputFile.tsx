import React, { useMemo, useRef, useEffect } from "react";
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
//helpers
import {
  createFileListFromArray,
  validateFile,
  processImage,
  validateImageDimensions,
} from "@/lib/helpers/image";
import { BannerCard, ProductCard } from "@/components/image/ImageCardStore";
import { ImageHint } from "@/components/shared/ImageHint";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { cn } from "@/lib/utils";

// ============================================
// PRESETS: toda la config específica de "tipo de imagen"
// vive acá, no adentro del componente.
// ============================================

export interface ImagePreset {
  /** Usado solo para elegir la card visual (Banner vs Product) y el hint */
  variant: "banner" | "product";
  processConfig?: {
    targetWidth: number;
    targetHeight: number;
    quality?: number;
    maxSizeBytes?: number;
  };
  dimensionCheck?: { minWidth: number; minHeight: number };
  gridClassName: string;
  cardAspect: "square" | "video";
}

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  banner: {
    variant: "banner",
    processConfig: {
      targetWidth: 1280,
      targetHeight: 730,
      quality: 0.88,
      maxSizeBytes: 180 * 1024,
    },
    dimensionCheck: { minWidth: 1280, minHeight: 730 },
    gridClassName: "grid-cols-1 md:grid-cols-2",
    cardAspect: "video",
  },
  product: {
    variant: "product",
    gridClassName: "grid-cols-2 md:grid-cols-4",
    cardAspect: "square",
  },
  logo: {
    variant: "product",
    processConfig: { targetWidth: 512, targetHeight: 512, quality: 0.9 },
    gridClassName: "grid-cols-1 md:grid-cols-2",
    cardAspect: "square",
  },
};

// ============================================
// TYPES
// ============================================

interface InputFileProps {
  /** Archivos nuevos (controlado por el padre, ej. RHF field o hook custom) */
  files: File[];
  onFilesChange: (files: File[]) => void;

  /** Imágenes ya existentes en storage (controlado por el padre) */
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;

  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  error?: string;

  preset: ImagePreset;
}

// ============================================
// COMPONENTE
// ============================================

export default function InputFile({
  files = [], // MODIFICADO: default defensivo. Si el padre manda undefined
  // (ej. un campo de RHF sin defaultValue todavía) esto no debe explotar.
  onFilesChange,
  existingUrls = [],
  onRemoveExisting,
  maxFiles = 5,
  maxSizeMB = 5,
  disabled = false,
  error,
  preset,
}: InputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // PREVIEWS: puramente derivado de `files`, no es estado propio.
  // ============================================

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  // Revocar URLs viejas cuando cambian los files o al desmontar
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;

    const validNewFiles: File[] = [];
    const errors: string[] = [];

    for (const file of Array.from(newFiles)) {
      const validationError = validateFile(file, maxSizeMB);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      if (preset.dimensionCheck) {
        const dimError = await validateImageDimensions(
          file,
          preset.dimensionCheck.minWidth,
          preset.dimensionCheck.minHeight,
        );
        if (dimError) {
          errors.push(dimError);
          continue;
        }
      }

      const processed = preset.processConfig
        ? await processImage(file, preset.processConfig)
        : await processImage(file);

      validNewFiles.push(processed);
    }

    if (errors.length > 0) {
      toast.error(errors.join("\n"), {
        position: "top-center",
        duration: 5000,
      });
    }

    const combined = [...files, ...validNewFiles];

    if (combined.length + existingUrls.length > maxFiles) {
      toast.error(`Solo puedes subir un máximo de ${maxFiles} imágenes`, {
        position: "top-center",
        duration: 5000,
      });
      return;
    }

    onFilesChange(combined);

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveNew = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleOpenFileDialog = () => inputRef.current?.click();

  // ============================================
  // COMPUTED
  // ============================================

  const totalImages = files.length + existingUrls.length;
  const hasImages = totalImages > 0;
  const canAddMore = totalImages < maxFiles && !disabled;
  const Card = preset.variant === "banner" ? BannerCard : ProductCard;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-3">
      <ImageHint typeElement={preset.variant} disabled={disabled} />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!hasImages ? (
        <div
          onClick={handleOpenFileDialog}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-blue-500 hover:bg-blue-50",
            error ? "border-red-500" : "border-gray-300",
          )}
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Haz clic para seleccionar imágenes
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Máximo {maxFiles} archivos de {maxSizeMB}MB cada uno
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className={cn("grid gap-3", preset.gridClassName)}>
            {existingUrls.map((url, index) => (
              <Card
                key={`existing-${url}`}
                url={getCatalogImageUrl(url)}
                onRemove={() => onRemoveExisting?.(url)}
                disabled={disabled}
              />
            ))}

            {files.map((_, index) => (
              <Card
                key={`new-${index}`}
                url={previewUrls[index]}
                onRemove={() => handleRemoveNew(index)}
                disabled={disabled}
              />
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={handleOpenFileDialog}
                className={cn(
                  preset.cardAspect === "video"
                    ? "aspect-video"
                    : "aspect-square",
                  "rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500",
                )}
              >
                <Plus className="w-8 h-8" />
                <span className="text-xs font-medium">Añadir más</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {totalImages} de {maxFiles} imágenes
            </span>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
