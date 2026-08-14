"use client";

import { useState } from "react";
import {
  Controller,
  Path,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
  type UseFormGetValues,
} from "react-hook-form";
import { type FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/products/form/RichTextEditor";
import InputFile, { IMAGE_PRESETS } from "@/components/shared/InputFile";
import SectionCard from "./SectionCard";

interface ProductMediaSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  errors: FieldErrors<FieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  maxImages: number;
  existingImages?: string[];
  isViewMode: boolean;
}

export function ProductMediaSection<TFieldValues extends FieldValues>({
  control,
  errors,
  setValue,
  getValues,
  maxImages,
  existingImages,
  isViewMode,
}: ProductMediaSectionProps<TFieldValues>) {
  // Image existing state is managed locally to reflect immediate UI changes when an image is removed, while the form state is updated accordingly to keep track of images to delete.
  const [currentExisting, setCurrentExisting] =
    useState<string[]>(existingImages ?? []);
  return (
    <SectionCard
      title="Contenido y medios"
      description="Descripción editorial e imágenes base del producto."
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label>
            Descripción<span className="text-red-500">*</span>
          </Label>
          <Controller
            name={"description" as Path<TFieldValues>}
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                disabled={isViewMode}
              />
            )}
          />
          {errors.description ? (
            <p className="text-sm text-red-500 font-medium">
              {String(errors.description.message)}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label>
            Imágenes del producto<span className="text-red-500">*</span>
          </Label>
          <Controller
            name={"product_images" as Path<TFieldValues>}
            control={control}
            render={({ field }) => (
              <InputFile
                preset={IMAGE_PRESETS.product}
                files={(field.value as File[]) ?? []}
                onFilesChange={(newFiles) => field.onChange(newFiles)}
                existingUrls={currentExisting}
                onRemoveExisting={(url) => {
                  const updated = currentExisting.filter((u) => u !== url);
                  setCurrentExisting(updated);
                  setValue(
                    "product_existing_images" as Path<TFieldValues>,
                    updated as TFieldValues[Path<TFieldValues>],
                    { shouldDirty: true },
                  );
                  const currentDeleted =
                    (getValues("imageToDelete" as Path<TFieldValues>) as
                      | string[]
                      | undefined) ?? [];

                  if (!currentDeleted.includes(url)) {
                    setValue(
                      "imageToDelete" as Path<TFieldValues>,
                      [...currentDeleted, url] as TFieldValues[Path<TFieldValues>],
                      { shouldDirty: true, shouldTouch: true },
                    );
                  }
                }}
                maxFiles={maxImages}
                maxSizeMB={25}
                disabled={isViewMode}
                error={
                  errors.product_images?.message as string | undefined
                }
              />
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}
