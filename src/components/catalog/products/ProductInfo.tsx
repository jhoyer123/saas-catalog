"use client";

import { ProductDetailCatalog } from "@/types/product.types";
import {
  ShoppingCart,
  MessageCircle,
  Star,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface ProductInfoProps {
  product: ProductDetailCatalog;
  whatssapNumber?: string | null;
  isOfferActive: boolean;
  discountPercent?: number | null;
}

function useHasOverflow() {
  const ref = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight);

    check(); // al montar
    const observer = new ResizeObserver(check); // si cambia el tamaño
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, hasOverflow };
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
  const { ref, hasOverflow } = useHasOverflow();

  return (
    <>
      <div className="flex flex-col gap-5 items-center justify-center h-full w-full px-2 py-4 bg-catalog-tertiary border border-border md:px-6 md:py-10">
        {/* ── BRAND ── */}
        {product.brand && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-catalog-secondary">
            {product.brand}
          </p>
        )}

        {/* ── TITLE ── */}
        <h1 className="font-popins text-center text-2xl font-bold leading-tight text-catalog-secondary md:text-3xl">
          {product.name}
        </h1>

        {/* ── BADGE (reemplaza las estrellas) ── */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ProductBadge type="featured" />
          <ProductBadge type="recommended" />
        </div>

        {/* ── PRICING ── */}
        <div className="flex items-end gap-4 flex-wrap justify-center">
          <span className="font-['Playfair_Display',serif] text-4xl font-bold tracking-tight text-catalog-secondary">
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

        {/* ── CTA BUTTONS ── */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
            {/* WhatsApp primero en mobile */}
            <a
              href={`https://wa.me/${telefono}?text=${encodeURIComponent(
                `¡Hola! Me gustaría hacer un pedido:

De este producto:
${product.name}
Precio: Bs. ${displayPrice!.toFixed(2)}

¿Está disponible? Me gustaría más información`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full flex items-center justify-center gap-2",
                "bg-[#25D366] hover:bg-[#20b958] active:bg-[#1da851]",
                "text-white font-semibold text-[16px]",
                "shadow-lg hover:shadow-xl transition-all duration-200 rounded-none",
              )}
            >
              <span className="flex items-center gap-2 text-[16px]">
                <MessageCircle className="h-5 w-5" />
                Pedir por WhatsApp
              </span>
            </a>
            <Button
              onClick={handleAddToCart}
              className="md:text-[16px] bg-catalog-secondary text-catalog-primary rounded-none"
            >
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
            </Button>
            <p className="mt-2 text-center text-xs text-catalog-secondary/70">
              Respuesta rápida por WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="mt-4 flex flex-col gap-5 w-full px-3 py-4 bg-catalog-tertiary border border-border md:px-6 md:py-10 max-h-100 overflow-y-auto md:max-h-150 custom-scroll"
        >
          {/* ── DESCRIPTION ── */}
          <div>
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
        </div>

        {/* Fade solo si hay overflow */}
        {hasOverflow && (
          <>
            <div className="pointer-events-none absolute bottom-px left-px right-px h-12 bg-linear-to-t from-catalog-tertiary to-transparent" />
            <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center">
              <ChevronDown className="h-4 w-4 animate-bounce text-catalog-secondary/50" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
