"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputFile from "@/components/products/form/InputFile";
import { bannerSchema, type BannerFormValues } from "@/lib/schemas/banner";
import { Button } from "@/components/ui/button";
import React from "react";
import { Plan } from "@/types/plan.types";
import { useHandleBannerActions } from "@/hooks/banner/useHandleBannerActions";
import { OverlayProcess } from "../shared/OverlayProcess";

interface BannerFormProps {
  existingBanners?: string[];
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  plan?: Plan;
}

export default function BannerForm({
  existingBanners = [],
  setIsEditing,
  plan,
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

  // SUBMIT
  const { saveBanners, isPending } = useHandleBannerActions();

  const onSubmit = (data: BannerFormValues) => {
    const newFiles = data.images ? Array.from(data.images) : [];
    saveBanners(newFiles, data.imageToDelete || [], () =>
      setIsEditing?.(false),
    );
  };

  const hasChanges =
    (images && images.length > 0) ||
    (imageToDelete && imageToDelete.length > 0);

  return (
    <>
      {/* Overlay de bloqueo */}
      {isPending && <OverlayProcess />}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 lg:space-y-8 w-full max-w-5xl mx-auto"
      >
        <div className="flex items-end justify-end mb-10">
          <Button type="submit" disabled={isPending || !hasChanges}>
            {isPending ? "Guardando..." : "Guardar Banners"}
          </Button>
        </div>
        <div className="space-y-2">
          <InputFile
            value={images}
            onChange={(files) => setValue("images", files)}
            error={errors.images?.message as string | undefined}
            maxFiles={plan?.max_banners || 3}
            maxSizeMB={25}
            imgExisting={existingBanners}
            setValue={setValue}
            typeElement="banner"
          />
        </div>
      </form>
    </>
  );
}
