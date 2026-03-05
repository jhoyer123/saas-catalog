"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSchema, type StoreForm } from "@/lib/schemas/store";
import type { Store } from "@/types/store.types";
import FormInput from "@/components/shared/InputForm";
import { Label } from "@/components/ui/label";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { useCreateStore } from "@/hooks/store/useCreateStore";
import { useUpdateStore } from "@/hooks/store/useStoreUpdate";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { processImage } from "@/lib/helpers/image";

interface Props {
  defaultValues?: Store;
}

const StoreForm = ({ defaultValues }: Props) => {
  const { showPromise } = useToastPromise();
  const { mutateAsync: createStore, isPending: isCreating } = useCreateStore();
  const { mutateAsync: updateStore, isPending: isUpdating } = useUpdateStore();

  const isEditing = !!defaultValues;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    defaultValues?.logo_url ?? null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      whatsapp_number: defaultValues?.whatsapp_number || "",
      logo_url: defaultValues?.logo_url || null,
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const finalFile = await processImage(file, {
      targetWidth: 200,
      targetHeight: 200,
      backgroundColor: "#ffffff",
      quality: 0.85,
      maxSizeBytes: 100 * 1024, // 100kb para un logo
    });

    setValue("logo", finalFile, { shouldValidate: true, shouldDirty: true });
    setPreview(URL.createObjectURL(finalFile));
  };

  const onSubmit = (data: StoreForm) => {
    const promise = isEditing
      ? updateStore({ id: defaultValues?.id || "", data })
      : createStore(data);

    promise.then(() => {
      reset(data); // resetea con los valores actuales, isDirty vuelve a false
    });

    showPromise({
      promise,
      messages: {
        loading: isEditing ? "Actualizando tienda..." : "Creando tienda...",
        success: isEditing ? "Tienda actualizada" : "Tienda creada",
        error: (err: Error) => err.message,
      },
      position: "top-right",
      duration: 4000,
    });
  };

  return (
    <form
      id="store-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 lg:space-y-8 w-full max-w-5xl mx-auto"
    >
      <div className="flex items-end justify-end mb-10">
        <Button type="submit" disabled={isCreating || isUpdating || !isDirty}>
          {isCreating || isUpdating ? "Guardando..." : "Guardar Datos"}
        </Button>
      </div>
      <div className="flex flex-col w-full gap-5 md:flex-row">
        {/* Logo */}
        <div className="grid gap-2 w-1/2">
          <Label className="font-medium text-sm">Logo de la Tienda</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-input dark:bg-input/30 flex h-32 w-32 cursor-pointer items-center mx-auto justify-center rounded-md border border-dashed transition hover:opacity-80"
          >
            {preview ? (
              <Image
                src={preview}
                alt="Logo preview"
                width={128}
                height={128}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm">Subir logo</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {errors.logo && (
            <p className="text-sm text-red-500">{errors.logo.message}</p>
          )}
        </div>

        <div className="grid gap-2 w-1/2">
          {/* Nombre */}
          <FormInput
            label="Nombre de la Tienda"
            name="name"
            register={register}
            inputProps={{ placeholder: "Mi tienda" }}
            errors={errors}
          />

          {/* WhatsApp */}
          <FormInput
            label="WhatsApp de la Tienda"
            name="whatsapp_number"
            register={register}
            inputProps={{ placeholder: "12345678" }}
            errors={errors}
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="grid gap-2">
        <Label className="font-medium text-sm">Descripción</Label>
        <textarea
          {...register("description")}
          placeholder="Descripción de tu tienda"
          className="file:text-foreground resize-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </form>
  );
};

export default StoreForm;
