"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputFile from "@/components/products/form/InputFile";
import { bannerSchema, type BannerFormValues } from "@/lib/schemas/banner";
import { Button } from "@/components/ui/button";
import { useUploadBanner } from "@/hooks/banner/useUploadBanner";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useUpdateBanner } from "@/hooks/banner/useUpdateBanner";
import React from "react";

// ============================================
// PROPS
// ============================================

interface BannerFormProps {
  existingBanners?: string[];
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
}

// ============================================
// COMPONENTE
// ============================================

export default function BannerForm({
  existingBanners = [],
  setIsEditing,
}: BannerFormProps) {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      images: undefined,
      imageExisting: existingBanners,
      imageToDelete: [],
    },
  });

  const images = watch("images");
  const imageToDelete = watch("imageToDelete");

  const UpdateOrCreate = existingBanners ? true : false;

  // ============================================
  // SUBMIT
  // ============================================
  const { showPromise } = useToastPromise();
  const uploadB = useUploadBanner();
  const updateB = useUpdateBanner();
  const onSubmit = (data: BannerFormValues) => {
    const newFiles = data.images ? Array.from(data.images) : [];

    //console.log("data", data);
    showPromise({
      promise: async () => {
        if (UpdateOrCreate) {
          await updateB.mutateAsync({
            newFiles,
            imagesToDelete: data.imageToDelete || [],
          });
        } else {
          await uploadB.mutateAsync(newFiles);
        }
        setIsEditing?.(false);
      },
      messages: {
        loading: UpdateOrCreate ? "Actualizando..." : "Subiendo banners...",
        success: UpdateOrCreate ? "Banners actualizados" : "Banners subidos",
        error: (err) => err.message,
      },
      position: "top-right",
      duration: 4000,
      richColors: true,
      className: "max-w-md bg-red-50 text-red-700 border border-red-200",
    });
  };

  const hasChanges =
    (images && images.length > 0) ||
    (imageToDelete && imageToDelete.length > 0);

  // ============================================
  // RENDER
  // ============================================
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 lg:space-y-8 w-full max-w-5xl mx-auto"
    >
      <div className="flex items-end justify-end mb-10">
        <Button
          type="submit"
          disabled={uploadB.isPending || updateB.isPending || !hasChanges}
        >
          {uploadB.isPending || updateB.isPending
            ? "Guardando..."
            : "Guardar Banners"}
        </Button>
      </div>
      <div className="space-y-2">
        <InputFile
          value={images}
          onChange={(files) => setValue("images", files)}
          error={errors.images?.message as string | undefined}
          maxFiles={3}
          maxSizeMB={5}
          imgExisting={existingBanners}
          setValue={setValue}
          typeElement="banner"
        />
      </div>
    </form>
  );
}
