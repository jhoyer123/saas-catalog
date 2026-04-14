"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Facebook, Instagram, Music2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { socialSchema, type SocialLinksForm } from "@/lib/schemas/settings";
import { OverlayProcess } from "../shared/OverlayProcess";

const socialFields = [
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/tu-pagina",
    badgeClass: "bg-[#1877F2] text-white",
    icon: Facebook,
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/tu-cuenta",
    badgeClass:
      "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] text-white",
    icon: Instagram,
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@tu-cuenta",
    badgeClass: "bg-black text-white",
    icon: Music2,
  },
  {
    key: "x",
    label: "X",
    placeholder: "https://x.com/tu-cuenta",
    badgeClass: "bg-black text-white",
    icon: X,
  },
] as const;

interface Props {
  defaultValues?: SocialLinksForm;
  onSubmit: (data: SocialLinksForm) => void | Promise<void>;
  submitLabel?: string;
  readOnly?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  isPending?: boolean;
}

export const FormSocials = ({
  defaultValues,
  onSubmit,
  submitLabel = "Guardar cambios",
  readOnly = false,
  onDirtyChange,
  isPending = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SocialLinksForm>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      facebook: defaultValues?.facebook || "",
      instagram: defaultValues?.instagram || "",
      tiktok: defaultValues?.tiktok || "",
      x: defaultValues?.x || "",
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleFormSubmit = async (data: SocialLinksForm) => {
    await onSubmit(data);
    reset(data);
  };

  const disabled = readOnly || isPending || isSubmitting;

  return (
    <>
      {isPending && <OverlayProcess />}
      <form
        id="socials-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full mx-auto space-y-3"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {socialFields.map((field) => {
            const fieldName = field.key as keyof SocialLinksForm;
            const fieldError = errors[fieldName];

            return (
              <div
                key={field.key}
                className="flex h-full flex-col rounded-xl border bg-background p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold uppercase ${field.badgeClass}`}
                    aria-hidden="true"
                  >
                    <field.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium leading-tight">{field.label}</h3>
                </div>

                <div className="grid gap-2 mt-auto">
                  <Label htmlFor={field.key}>
                    URL<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field.key}
                    type="url"
                    placeholder={field.placeholder}
                    disabled={disabled}
                    {...register(field.key)}
                  />
                  {fieldError && (
                    <p className="text-sm text-red-500">
                      {String(fieldError.message)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={disabled || !isDirty}>
            {disabled ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormSocials;
