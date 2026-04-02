"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { offerSchema, type OfferFormValues } from "@/lib/schemas/product";
import type { ProductCatalog } from "@/types/product.types";
import { useProductActions } from "@/hooks/products/useHandleAction";
import { MessageFormOffer } from "./MessageFormOffer";

interface FormOfferProps {
  product: ProductCatalog;
  onClose: () => void;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function FormOffer({ product, onClose }: FormOfferProps) {
  const { toggleOffer } = useProductActions();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema(product.price)),
    defaultValues: {
      is_offer: product.is_offer,
      offer_price: product.offer_price
        ? Number(product.offer_price)
        : undefined,
      offer_start: toDatetimeLocal(product.offer_start),
      offer_end: toDatetimeLocal(product.offer_end),
    },
  });

  const isOffer = watch("is_offer");
  const offerPrice = watch("offer_price");

  // Tiene datos guardados previamente (aunque ahora esté desactivando)
  const hasExistingData = Boolean(
    product.offer_price && product.offer_start && product.offer_end,
  );

  // Mostrar campos si: está activando O si ya tiene datos (para que no desaparezcan)
  const showFields = isOffer || hasExistingData;

  // Campos editables solo cuando el toggle está ON
  const fieldsDisabled = !isOffer;

  const discount =
    offerPrice && offerPrice > 0 && offerPrice < product.price
      ? Math.round(((product.price - offerPrice) / product.price) * 100)
      : null;

  const onSubmit = (data: OfferFormValues) => {
    toggleOffer(
      product.slug,
      {
        id: product.id,
        is_offer: data.is_offer,
        offer_price: data.is_offer ? data.offer_price! : null,
        offer_start:
          data.is_offer && data.offer_start
            ? new Date(data.offer_start).toISOString()
            : null,
        offer_end:
          data.is_offer && data.offer_end
            ? new Date(data.offer_end).toISOString()
            : null,
      },
      onClose,
    );
  };

  return (
    <form
      id="form-offer"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {/* ── Estado dinámico ──────────────────────────────────────────────── */}
      <MessageFormOffer product={product} isOffer={isOffer} />

      {/* ── Toggle ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <Label htmlFor="toggle-offer" className="cursor-pointer select-none">
          <span className="text-sm font-medium">
            {isOffer ? "Oferta activada" : "Activar oferta"}
          </span>
        </Label>
        <Controller
          control={control}
          name="is_offer"
          render={({ field }) => (
            <Switch
              id="toggle-offer"
              checked={field.value}
              onCheckedChange={field.onChange}
              //disabled={isTogglingOffer}
            />
          )}
        />
      </div>

      {/* ── Campos: visibles si está activo O si ya había datos guardados ── */}
      {showFields && (
        <div className={fieldsDisabled ? "opacity-50 pointer-events-none" : ""}>
          {/* Precio */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="offer_price">Precio de oferta</Label>
              <span className="text-xs text-muted-foreground">
                Original: ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="offer_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  {...register("offer_price", { valueAsNumber: true })}
                />
              </div>
              {discount !== null ? (
                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  -{discount}% off
                </span>
              ) : (
                <span className="w-16 shrink-0" />
              )}
            </div>
            {errors.offer_price && !fieldsDisabled && (
              <p className="text-xs text-destructive">
                {errors.offer_price.message}
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="offer_start">Fecha de inicio</Label>
              <Input
                id="offer_start"
                type="datetime-local"
                {...register("offer_start")}
              />
              {errors.offer_start && !fieldsDisabled && (
                <p className="text-xs text-destructive">
                  {errors.offer_start.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer_end">Fecha de fin</Label>
              <Input
                id="offer_end"
                type="datetime-local"
                {...register("offer_end")}
              />
              {errors.offer_end && !fieldsDisabled && (
                <p className="text-xs text-destructive">
                  {errors.offer_end.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
