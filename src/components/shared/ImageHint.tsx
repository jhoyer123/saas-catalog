"use client";

import {
  Info,
  ImageIcon,
  Square,
  RectangleHorizontal,
  Maximize2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const IMAGE_HINTS = {
  product: {
    short: "Guía de imagen",
    title: "Foto de producto",
    description:
      "Una foto clara del producto ayuda a que tus clientes entiendan mejor lo que vendes.",
    preview: "square",
    tips: [
      { icon: Square, text: "Formato cuadrado (1:1)" },
      { icon: Maximize2, text: "Resolución recomendada 800 × 800 px o más" },
      { icon: ImageIcon, text: "Buena iluminación y fondo simple" },
      { icon: Info, text: "La plataforma optimiza la imagen automáticamente" },
    ],
  },

  banner: {
    short: "Guía de imagen",
    title: "Imagen de banner",
    description: "Los banners sirven para promociones o anuncios importantes.",
    preview: "banner",
    tips: [
      { icon: RectangleHorizontal, text: "Formato panorámico (ancho)" },
      { icon: Maximize2, text: "Resolución recomendada 1440 × 500 px" },
      { icon: ImageIcon, text: "Ideal para promociones o anuncios" },
      { icon: Info, text: "La plataforma ajusta la imagen automáticamente" },
    ],
  },

  logo: {
    short: "Guía de imagen",
    title: "Logo de tu tienda",
    description:
      "Usa el logo principal de tu marca para que tu catálogo sea reconocible.",
    preview: "square",
    tips: [
      { icon: Square, text: "Formato cuadrado (1:1)" },
      { icon: Maximize2, text: "Resolución mínima 200 × 200 px" },
      { icon: ImageIcon, text: "Fondo transparente o blanco" },
      { icon: Info, text: "La plataforma ajusta el tamaño automáticamente" },
    ],
  },
} as const;

interface ImageHintProps {
  typeElement: "product" | "banner" | "logo";
  disabled?: boolean;
}

export function ImageHint({ typeElement, disabled }: ImageHintProps) {
  if (disabled) return null;

  const hint = IMAGE_HINTS[typeElement];
  const isBanner = hint.preview === "banner";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-help transition-colors">
            <Info className="w-3.5 h-3.5" />
            {hint.short}
          </span>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="start"
          className="w-64 p-4 rounded-xl shadow-xl bg-background border"
        >
          <div className="flex flex-col gap-3">
            {/* Title */}
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-foreground/80" />
              <p className="text-sm font-semibold text-foreground">
                {hint.title}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hint.description}
            </p>

            {/* Preview */}
            <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-2">
              <div
                className={`border border-dashed rounded flex items-center justify-center text-[10px] text-muted-foreground
                ${isBanner ? "w-16 h-6" : "w-10 h-10"}`}
              >
                {isBanner ? "Banner" : "1:1"}
              </div>

              <span className="text-xs text-muted-foreground">
                {isBanner
                  ? "Imagen panorámica similar a portadas."
                  : "Imagen cuadrada como en tiendas online."}
              </span>
            </div>

            {/* Tips */}
            <div className="flex flex-col gap-2">
              {hint.tips.map((tip, i) => {
                const Icon = tip.icon;

                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Icon className="w-3.5 h-3.5 mt-0.5 text-foreground/70 shrink-0" />
                    <span>{tip.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
