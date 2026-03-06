"use client";

import { ProductCatalog } from "@/types/product.types";
import { ShoppingCart, MessageCircle, Star } from "lucide-react";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductCatalog;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = product.is_offer_active
    ? product.offer_price
    : product.price;

  const discountPercentage = product.is_offer_active
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;

  /** Agrega el producto al carrito con su info básica */
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      image: product.images[0] || "/images/placeholder.png",
      price: displayPrice!,
    });
    toast.success("Producto agregado al carrito");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-2 py-4 bg-card border border-border rounded-2xl md:px-6 md:py-20">
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

      {/* ── RATING (decorative – wire up your real data) ── */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i <= 4
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200",
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-500">4.0 / 5.0</span>
        <span className="text-sm text-gray-400">(128 reseñas)</span>
      </div>

      {/* ── DIVIDER ── */}
      <div className="my-5 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />

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

      {/* ── CTA BUTTONS (sticky on mobile) ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Add to Cart */}
        <Button onClick={handleAddToCart} disabled={!product.is_available}>
          <ShoppingCart className="h-5 w-5" />
          Agregar al Carrito
        </Button>

        {/* WhatsApp / Request */}
        <a
          href={`https://wa.me/59162557286?text=${encodeURIComponent(
            `Hola! Me interesa el producto: ${product.name}`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "gap-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          Solicitar por WhatsApp
        </a>
      </div>
    </div>
  );
}
