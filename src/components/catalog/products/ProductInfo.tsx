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

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5 fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
            {/* WhatsApp primero en mobile */}
            <a
              href={`https://wa.me/${telefono}?text=${encodeURIComponent(
                `Hola, vi este producto en su catálogo.

De este producto:
${product.name}
Precio: Bs. ${displayPrice!.toFixed(2)}

¿Está disponible?`,
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
                <WhatsAppIcon />
                Comprar por WhatsApp
              </span>
            </a>
            <Button
              onClick={handleAddToCart}
              className="md:text-[16px] bg-catalog-secondary text-catalog-primary rounded-none lg:w-auto hover:bg-catalog-secondary/90 focus:bg-catalog-secondary/90 active:bg-catalog-secondary/80"
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
