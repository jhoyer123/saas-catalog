// components/products/form/InputFile.improved.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, Plus } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";

// ============================================
// TYPES
// ============================================

interface ImagePreview {
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
}

// ============================================
// HELPERS
// ============================================

/**
 * Convierte FileList a array de previews
 */
function createPreviewsFromFileList(fileList: FileList): ImagePreview[] {
  return Array.from(fileList).map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
}

/**
 * Convierte array de Files a FileList
 */
function createFileListFromArray(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
}

/**
 * Valida un archivo individual
 */
function validateFile(file: File, maxSizeMB: number): string | null {
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return `${file.name} no es una imagen válida`;
  }

  // Validar tamaño
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `${file.name} excede el tamaño máximo de ${maxSizeMB}MB`;
  }

  return null;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = e.target.files;
      if (!newFiles || newFiles.length === 0) return;

      // Obtener archivos actuales
      const currentFiles = previews.map((p) => p.file);

      // Validar cada archivo nuevo
      const validNewFiles: File[] = [];
      const errors: string[] = [];

      Array.from(newFiles).forEach((file) => {
        const error = validateFile(file, maxSizeMB);
        if (error) {
          errors.push(error);
        } else {
          validNewFiles.push(file);
        }
      });

      // Mostrar errores
      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      // Combinar archivos
      const combinedFiles = [...currentFiles, ...validNewFiles];

      // Validar límite total
      if (combinedFiles.length + existingImages.length > maxFiles) {
        alert(`Solo puedes subir un máximo de ${maxFiles} imágenes`);
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
            {existingImages.map((url, index) => (
              <ImageCard
                key={`existing-${index}`}
                url={url}
                onRemove={() => handleRemoveExistingImage(index)}
                disabled={disabled}
              />
            ))}

            {/* Imágenes nuevas */}
            {previews.map((preview, index) => (
              <ImageCard
                key={`new-${index}`}
                url={preview.url}
                onRemove={() => handleRemoveImage(index)}
                disabled={disabled}
              />
            ))}

            {/* Botón para añadir más */}
            {canAddMore && (
              <button
                type="button"
                onClick={handleOpenFileDialog}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500"
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

// ============================================
// SUB-COMPONENTES
// ============================================

interface ImageCardProps {
  url: string;
  onRemove: () => void;
  disabled: boolean;
}

function ImageCard({ url, onRemove, disabled }: ImageCardProps) {
  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <img
        loading="lazy"
        src={url}
        alt="Preview"
        className="w-full h-full object-cover"
      />

      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
