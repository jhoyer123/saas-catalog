import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Plus, Info } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";
//helpers
import {
  createPreviewsFromFileList,
  createFileListFromArray,
  validateFile,
  processImage,
} from "@/lib/helpers/image";
import { BannerCard, ProductCard } from "@/components/image/ImageCardStore";
import { ImageHint } from "@/components/shared/ImageHint";

// TYPES
export interface ImagePreview {
  file: File;
  url: string;
}

interface InputFileProps {
  value?: FileList | null;
  onChange: (files: FileList | null) => void;
  onBlur?: () => void;
  error?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  imgExisting?: string[];
  setValue?: UseFormSetValue<any>; // TODO: Podríamos tiparlo mejor con generics
  typeElement?: "banner" | "product";
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function InputFile({
  value,
  onChange,
  onBlur,
  error,
  maxFiles = 5,
  maxSizeMB = 5,
  disabled = false,
  imgExisting = [],
  setValue,
  typeElement = "product",
}: InputFileProps) {
  // ============================================
  // STATE
  // ============================================

  const [existingImages, setExistingImages] = useState<string[]>(imgExisting);
  const [deletedUrls, setDeletedUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // EFFECTS
  // ============================================

  // Sincronizar previews cuando cambia el value externo
  useEffect(() => {
    if (value && value.length > 0) {
      const newPreviews = createPreviewsFromFileList(value);
      setPreviews(newPreviews);
    } else {
      // Limpiar URLs anteriores
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setPreviews([]);
    }
  }, [value]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Maneja selección de nuevos archivos
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = e.target.files;
      if (!newFiles || newFiles.length === 0) return;

      // Obtener archivos actuales
      const currentFiles = previews.map((p) => p.file);

      // Validar cada archivo nuevo
      const validNewFiles: File[] = [];
      const errors: string[] = [];

      for (const file of Array.from(newFiles)) {
        const error = validateFile(file, maxSizeMB);
        if (error) {
          errors.push(error);
        } else {
          const processed =
            typeElement === "banner"
              ? await processImage(file, {
                  targetWidth: 1440,
                  targetHeight: 500,
                  quality: 0.88,
                  maxSizeBytes: 300 * 1024, // 300kb para banners
                })
              : await processImage(file);
          validNewFiles.push(processed);
        }
      }

      // Mostrar errores
      if (errors.length > 0) {
        //alert(errors.join("\n"));
        toast.error(errors.join("\n"), {
          position: "top-center",
          duration: 5000,
        });
      }

      // Combinar archivos
      const combinedFiles = [...currentFiles, ...validNewFiles];

      // Validar límite total
      if (combinedFiles.length + existingImages.length > maxFiles) {
        //alert(`Solo puedes subir un máximo de ${maxFiles} imágenes`);
        toast.error(`Solo puedes subir un máximo de ${maxFiles} imágenes`, {
          position: "top-center",
          duration: 5000,
        });
        return;
      }

      // Notificar cambio
      onChange(createFileListFromArray(combinedFiles));

      // Resetear input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [previews, existingImages, maxFiles, maxSizeMB, onChange],
  );

  /**
   * Elimina una imagen nueva
   */
  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const currentFiles = previews.map((p) => p.file);
      const newFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove,
      );

      // Revocar URL
      URL.revokeObjectURL(previews[indexToRemove].url);

      if (newFiles.length === 0) {
        onChange(null);
      } else {
        onChange(createFileListFromArray(newFiles));
      }
    },
    [previews, onChange],
  );

  /**
   * Elimina una imagen existente
   */
  const handleRemoveExistingImage = useCallback(
    (index: number) => {
      const urlToRemove = existingImages[index];

      const updatedExisting = existingImages.filter((_, i) => i !== index);
      const updatedDeleted = Array.from(new Set([...deletedUrls, urlToRemove]));

      setExistingImages(updatedExisting);
      setDeletedUrls(updatedDeleted);

      // Actualizar el formulario padre
      if (setValue) {
        setValue("imageExisting", updatedExisting);
        setValue("imageToDelete", updatedDeleted, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    },
    [existingImages, deletedUrls, setValue],
  );

  /**
   * Abre el selector de archivos
   */
  const handleOpenFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // ============================================
  // COMPUTED
  // ============================================

  const totalImages = previews.length + existingImages.length;
  const hasImages = totalImages > 0;
  const canAddMore = totalImages < maxFiles && !disabled;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-3">
      <ImageHint typeElement={typeElement} disabled={disabled} />

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        onBlur={onBlur}
        className="hidden"
        disabled={disabled}
      />

      {/* Zona de drop inicial */}
      {!hasImages ? (
        <div
          onClick={handleOpenFileDialog}
          className={`
            border-2 border-dashed rounded-lg p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer transition-colors
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-blue-500 hover:bg-blue-50"
            }
            ${error ? "border-red-500" : "border-gray-300"}
          `}
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
          {/* Grid de previews */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Imágenes existentes */}
            {existingImages.map((url, index) =>
              typeElement === "banner" ? (
                <BannerCard
                  key={`existing-${index}`}
                  url={url}
                  onRemove={() => handleRemoveExistingImage(index)}
                  disabled={disabled}
                />
              ) : (
                <ProductCard
                  key={`existing-${index}`}
                  url={url}
                  onRemove={() => handleRemoveExistingImage(index)}
                  disabled={disabled}
                />
              ),
            )}

            {/* Imágenes nuevas */}
            {previews.map((preview, index) =>
              typeElement === "banner" ? (
                <BannerCard
                  key={`new-${index}`}
                  url={preview.url}
                  onRemove={() => handleRemoveImage(index)}
                  disabled={disabled}
                />
              ) : (
                <ProductCard
                  key={`new-${index}`}
                  url={preview.url}
                  onRemove={() => handleRemoveImage(index)}
                  disabled={disabled}
                />
              ),
            )}

            {/* Botón para añadir más */}
            {canAddMore && (
              <button
                type="button"
                onClick={handleOpenFileDialog}
                className={`${typeElement === "banner" ? "aspect-video" : "aspect-square"} rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500`}
              >
                <Plus className="w-8 h-8" />
                <span className="text-xs font-medium">Añadir más</span>
              </button>
            )}
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {totalImages} de {maxFiles} imágenes
            </span>
          </div>
        </>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
