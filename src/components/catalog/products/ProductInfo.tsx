"use client";

import { ProductDetailCatalog } from "@/types/product.types";
import { ShoppingCart, MessageCircle, Star, Sparkles } from "lucide-react";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductDetailCatalog;
  whatssapNumber?: string | null;
  isOfferActive: boolean;
  discountPercent?: number | null;
}

// ─── Badge config ───────────────────────────────────────────────
type BadgeType = "featured" | "recommended" | null;

const BADGE_CONFIG: Record<
  NonNullable<BadgeType>,
  {
    label: string;
    icon: React.ReactNode;
    className: string;
  }
> = {
  featured: {
    icon: <Star className="h-3.5 w-3.5" />,
    label: "Destacado",
    className:
      "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/60 shadow-sm",
  },

  recommended: {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Recomendado",
    className:
      "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60 shadow-sm",
  },
};

function ProductBadge({ type }: { type: BadgeType }) {
  if (!type) return null;

  const { icon, label, className } = BADGE_CONFIG[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "text-[11px] font-semibold tracking-wide",
        "transition-all duration-200",
        "backdrop-blur-sm",
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

export function ProductInfo({
  product,
  whatssapNumber,
  isOfferActive,
  discountPercent,
}: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = isOfferActive ? product.offer_price : product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.images[0] || "/images/placeholder.png",
      price: displayPrice!,
    });
    toast.success("Producto agregado al carrito", { position: "bottom-right" });
  };

  const telefono = whatssapNumber;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-2 py-4 bg-catalog-primary border border-border rounded-2xl md:px-6 md:py-10">
      {/* ── BRAND ── */}
      {product.brand && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-catalog-secondary">
          {product.brand}
        </p>
      )}

      {/* ── TITLE ── */}
      <h1 className="font-popins text-center text-3xl font-bold leading-tight text-catalog-secondary md:text-4xl">
        {product.name}
      </h1>

      {/* ── BADGE (reemplaza las estrellas) ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 my-5">
        <ProductBadge type="featured" />
        <ProductBadge type="recommended" />
      </div>

      {/* ── PRICING ── */}
      <div className="flex items-end gap-4 flex-wrap justify-center">
        <span className="font-['Playfair_Display',serif] text-5xl font-bold tracking-tight text-catalog-secondary">
          Bs. {displayPrice!.toFixed(2)}
        </span>

        {isOfferActive && (
          <div className="mb-1 flex flex-col items-start">
            <span className="text-lg text-gray-400 line-through">
              Bs. {product.price.toFixed(2)}
            </span>
            <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              AHORRA {discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div className="my-5 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

      {/* ── DESCRIPTION ── */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold font-inter uppercase tracking-[0.15em] text-catalog-secondary/80">
          Descripción
        </h3>
        <div
          className="prose prose-sm font-inter max-w-none text-catalog-secondary/90 leading-relaxed [&>p]:mb-2"
          dangerouslySetInnerHTML={{
            __html: product.description
              ? product.description
              : "No hay descripción disponible.",
          }}
        />
      </div>

      {/* ── CTA BUTTONS ── */}
      <div className="w-full">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* WhatsApp primero en mobile */}
          <a
            href={`https://wa.me/${telefono}?text=${encodeURIComponent(
              `Hola, quiero este producto: ${product.name} (Bs. ${displayPrice!.toFixed(2)}). ¿Está disponible?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "order-1 md:order-2 gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white md:text-[16px]",
            )}
          >
            <MessageCircle className="h-5 w-5" />
            Consultar stock y entrega
          </a>

          <Button
            onClick={handleAddToCart}
            className="order-2 md:order-1 md:text-[16px] bg-catalog-secondary text-catalog-primary"
          >
            <ShoppingCart className="h-5 w-5" />
            Agregar al carrito
          </Button>
        </div>

        <p className="mt-2 text-center text-xs text-catalog-secondary/70">
          Respuesta rápida por WhatsApp. Sin compromiso.
        </p>
      </div>
    </div>
  );
}
