"use client";

import { ProductCatalog } from "@/types/product.types";
import { ShoppingCart, MessageCircle, Star, Sparkles } from "lucide-react";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSessionData } from "@/hooks/auth/useSessionData";

interface ProductInfoProps {
  product: ProductCatalog;
  whatssapNumber?: string | null;
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

// ─── Cambiar este valor por producto cuando tengas BD ───────────
// Ejemplo futuro: const badge: BadgeType = product.badge ?? null;
const DEMO_BADGE: BadgeType = "featured"; // ← cambia aquí mientras tanto

export function ProductInfo({ product, whatssapNumber }: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = product.is_offer_active
    ? product.offer_price
    : product.price;

  const discountPercentage = product.is_offer_active
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;

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
    <div className="flex flex-col items-center justify-center h-full px-2 py-4 bg-card border border-border rounded-2xl md:px-6 md:py-10">
      {/* ── BRAND ── */}
      {product.brand && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          {product.brand}
        </p>
      )}

      {/* ── TITLE ── */}
      <h1 className="font-popins text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
        {product.name}
      </h1>

      {/* ── BADGE (reemplaza las estrellas) ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 my-5">
        <ProductBadge type="featured" />
        <ProductBadge type="recommended" />
      </div>

      {/* ── PRICING ── */}
      <div className="flex items-end gap-4 flex-wrap justify-center">
        <span className="font-['Playfair_Display',serif] text-5xl font-bold tracking-tight text-gray-900">
          Bs. {displayPrice!.toFixed(2)}
        </span>

        {product.is_offer_active && (
          <div className="mb-1 flex flex-col items-start">
            <span className="text-lg text-gray-400 line-through">
              Bs. {product.price.toFixed(2)}
            </span>
            <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              AHORRA {discountPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div className="my-5 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

      {/* ── DESCRIPTION ── */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-bold font-inter uppercase tracking-[0.15em] text-gray-500">
          Descripción
        </h3>
        <div
          className="prose prose-sm font-inter max-w-none text-gray-600 leading-relaxed [&>p]:mb-2"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>

      {/* ── CTA BUTTONS ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Button
          onClick={handleAddToCart}
          disabled={!product.is_available}
          className="md:text-[16px]"
        >
          <ShoppingCart className="h-5 w-5" />
          Agregar al Carrito
        </Button>

        <a
          href={`https://wa.me/${telefono}?text=${encodeURIComponent(
            `Hola! Me interesa el producto: ${product.name} - Bs. ${displayPrice!.toFixed(2)}`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "gap-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white md:text-[16px]",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          Solicitar por WhatsApp
        </a>
      </div>
    </div>
  );
}
