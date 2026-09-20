"use client";

import { RefObject } from "react";
import { FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import type { OptionValueForm } from "../schemas/optionValue.schema";

interface Props {
  imagePreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  errors: FieldErrors<OptionValueForm>;
  getImageSrc: (preview: string) => string;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function OptionValueImageField({
  imagePreview,
  fileInputRef,
  disabled,
  errors,
  getImageSrc,
  onSelectImage,
  onRemoveImage,
}: Props) {
  return (
    <div className="grid w-full gap-2">
      <Label className="text-sm font-medium">Imagen</Label>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectImage}
        disabled={disabled}
      />
      {imagePreview ? (
        <div className="relative inline-block w-24 h-24 mt-1">
          <img
            src={getImageSrc(imagePreview)}
            alt="Preview"
            className="h-24 w-24 rounded-lg object-cover border border-border"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90 transition shadow-sm"
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full sm:w-auto mt-1 flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Seleccionar imagen
          </Button>
          {errors.image_url && (
            <p className="text-sm text-red-500">
              {String(errors.image_url.message)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
