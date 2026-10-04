"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { storeSchema, type StoreForm } from "@/lib/schemas/store";
import type { Store } from "@/types/store.types";
import FormInput from "@/components/shared/InputForm";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { processImage } from "@/lib/helpers/image";
import { ImageHint } from "../shared/ImageHint";
import { useHandleStoreActions } from "@/hooks/store/useHandleStoreAction";
import { OverlayProcess } from "../shared/OverlayProcess";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

interface Props {
  defaultValues?: Store;
}

const formatInitialPhone = (phone: string | null | undefined) => {
  if (!phone) return "";
  return /^\d{8}$/.test(phone) ? `+503${phone}` : phone;
};

const getCountryFromPhone = (phone: string) => {
  return getCountries()
    .sort(
      (first, second) =>
        getCountryCallingCode(second).length -
        getCountryCallingCode(first).length,
    )
    .find((country) => phone.startsWith(`+${getCountryCallingCode(country)}`));
};

const getPhoneDigits = (phone: string, country: Country) =>
  phone.replace(`+${getCountryCallingCode(country)}`, "").replace(/\D/g, "");

const countryName = new Intl.DisplayNames(["es"], { type: "region" });

const StoreForm = ({ defaultValues }: Props) => {
  const isEditing = !!defaultValues;
  const initialPhone = formatInitialPhone(defaultValues?.whatsapp_number);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    getCountryFromPhone(initialPhone) ?? "BO",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    defaultValues?.logo_url ? getCatalogImageUrl(defaultValues.logo_url) : null,
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      whatsapp_number: formatInitialPhone(defaultValues?.whatsapp_number),
      logo_url: defaultValues?.logo_url || null,
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const finalFile = await processImage(file, {
      targetWidth: 100,
      targetHeight: null,
      backgroundColor: "#ffffff",
      quality: 0.85,
      maxSizeBytes: 100 * 1024, // 100kb para un logo
    });

    setValue("logo", finalFile, { shouldValidate: true, shouldDirty: true });
    setPreview(URL.createObjectURL(finalFile));
  };

  const storeSlug = defaultValues?.slug;
  const storeId = defaultValues?.id;

  const { createStore, updateStore, isPending } = useHandleStoreActions();

  const onSubmit = (data: StoreForm) => {
    if (isEditing) {
      updateStore(storeId!, data, storeSlug!, () => reset(data));
    } else {
      createStore(data, () => reset(data));
    }
  };

  return (
    <>
      {/* Overlay de bloqueo */}
      {isPending && <OverlayProcess />}
      <form
        id="store-form"
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto min-w-0 w-full space-y-4 lg:space-y-8"
      >
        <div className="flex items-end justify-end mb-10">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? "Guardando..." : "Guardar Datos"}
          </Button>
        </div>
        <div className="flex min-w-0 w-full flex-col gap-5 md:flex-row">
          {/* Logo */}
          <div className="grid min-w-0 w-full gap-2 md:w-1/2">
            <Label className="font-medium text-sm">
              Logo de la Tienda <span className="text-red-500">*</span>
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-input dark:bg-input/30 flex max-h-48 max-w-48 h-auto w-auto cursor-pointer items-center mx-auto justify-center rounded-md border border-dashed transition hover:opacity-80"
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="Logo preview"
                  width={192}
                  height={192}
                  loading="eager"
                  priority
                  className="h-auto w-auto max-h-48 max-w-48 rounded-md object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm m-2">
                  Subir logo
                </span>
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
            <div className="w-auto">
              <ImageHint typeElement="logo" />
            </div>
          </div>

          <div className="grid min-w-0 w-full gap-2 md:w-1/2">
            {/* Nombre */}
            <FormInput
              label="Nombre de la Tienda"
              name="name"
              control={control}
              inputProps={{ placeholder: "Mi tienda" }}
              errors={errors}
              required
            />

            {/* WhatsApp */}
            <div className="grid w-full gap-2">
              <Label htmlFor="whatsapp_number" className="mt-1">
                WhatsApp de la Tienda <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="whatsapp_number"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <div className="flex h-9 min-w-0 w-full items-center overflow-hidden rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs md:text-sm">
                      <div className="relative h-6 w-8 shrink-0">
                        {(() => {
                          const Flag = flags[selectedCountry];
                          return Flag ? (
                            <span className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover">
                              <Flag
                                title={
                                  countryName.of(selectedCountry) ?? selectedCountry
                                }
                              />
                            </span>
                          ) : null;
                        })()}
                        <select
                          aria-label="Código de país"
                          value={selectedCountry}
                          disabled={isPending}
                          onChange={(event) => {
                            const country = event.target.value as Country;
                            setSelectedCountry(country);
                            const digits = getPhoneDigits(
                              field.value,
                              selectedCountry,
                            );
                            field.onChange(
                              digits
                                ? `+${getCountryCallingCode(country)}${digits}`
                                : "",
                            );
                          }}
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        >
                          {getCountries().map((country) => (
                            <option key={country} value={country}>
                              {countryName.of(country)} (+
                              {getCountryCallingCode(country)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="ml-2 text-muted-foreground" aria-hidden>
                        +{getCountryCallingCode(selectedCountry)}
                      </span>
                      <input
                        id="whatsapp_number"
                        value={getPhoneDigits(field.value, selectedCountry)}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "");
                          field.onChange(
                            digits
                              ? `+${getCountryCallingCode(selectedCountry)}${digits}`
                              : "",
                          );
                        }}
                        placeholder="7689 8907"
                        inputMode="numeric"
                        disabled={isPending}
                        className="ml-2 min-w-0 flex-1 border-0 bg-transparent p-0 outline-none ring-0 placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-sm font-medium text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
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
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default StoreForm;
