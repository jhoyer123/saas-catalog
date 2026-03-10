"use client";

import { CheckCircle2, Clock, TagIcon, Trash2 } from "lucide-react";
import type { ProductCatalog } from "@/types/product.types";

interface OfferStatusProps {
  product: ProductCatalog;
  isOffer: boolean; // valor actual del toggle
}

type OfferState =
  | "never" // nunca tuvo oferta, quiere activar
  | "active" // tiene oferta vigente
  | "expired" // tiene oferta caducada (datos de última oferta)
  | "deactivating" // tenía oferta activa, está por desactivar
  | "reactivating"; // tenía oferta (activa o caducada), está por reactivar con datos previos

function getOfferState(product: ProductCatalog, isOffer: boolean): OfferState {
  const hasData = Boolean(product.offer_price);
  const isExpired = product.offer_end
    ? new Date(product.offer_end) < new Date()
    : false;

  // Usuario está cambiando respecto a lo guardado
  if (!product.is_offer && isOffer && hasData) return "reactivating";
  if (!product.is_offer && isOffer && !hasData) return "never";
  if (product.is_offer && !isOffer) return "deactivating";

  // Sin cambios
  if (!isOffer) return hasData ? "expired" : "never";
  if (isExpired) return "expired";
  return "active";
}

type StatusConfig = {
  icon: React.ElementType;
  iconClass: string;
  containerClass: string;
  title: string;
  description: (p: ProductCatalog) => string;
};

const STATUS_CONFIG: Record<OfferState, StatusConfig> = {
  never: {
    icon: TagIcon,
    iconClass: "text-amber-600",
    containerClass: "bg-amber-50 border-amber-200 text-amber-800",
    title: "Sin oferta",
    description: () => "Crea una oferta completando todos los datos.",
  },
  active: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    containerClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    title: "Oferta activa",
    description: (p) => {
      if (!p.offer_end) return "La oferta está activa.";
      const end = new Date(p.offer_end).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Vigente hasta el ${end}.`;
    },
  },
  expired: {
    icon: Clock,
    iconClass: "text-orange-600",
    containerClass: "bg-orange-50 border-orange-200 text-orange-800",
    title: "Esta oferta caducó o fue anulada",
    description: (p) => {
      const end = p.offer_end
        ? new Date(p.offer_end).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : null;
      return `Crea una nueva, actualizando los datos.`;
    },
  },
  deactivating: {
    icon: Trash2,
    iconClass: "text-rose-600",
    containerClass: "bg-rose-50 border-rose-200 text-rose-800",
    title: "¿Desactivar oferta?",
    description: (p) =>
      `Se quitará la oferta de $${p.offer_price?.toFixed(2)}. Los datos quedarán guardados como referencia y tendras que actualizar las fechas para volver a activarla.`,
  },
  reactivating: {
    icon: Clock,
    iconClass: "text-blue-600",
    containerClass: "bg-blue-50 border-blue-200 text-blue-800",
    title: "Datos de la última oferta",
    description: () =>
      "Estos son los datos de la última oferta activa. Debes actualizar las fechas antes de guardar.",
  },
};

export function MessageFormOffer({ product, isOffer }: OfferStatusProps) {
  const state = getOfferState(product, isOffer);
  const config = STATUS_CONFIG[state];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${config.containerClass}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
      <div>
        <p className="font-medium leading-none mb-0.5">{config.title}</p>
        <p className="text-xs opacity-80">{config.description(product)}</p>
      </div>
    </div>
  );
}
