"use client";

import { ProductCatalog } from "@/types/product.types";
import {
  ShoppingCart,
  MessageCircle,
  Star,
  Heart,
  Share2,
  Shield,
  Truck,
} from "lucide-react";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: ProductCatalog;
  onAddToCart?: () => void;
}

export function ProductInfo({ product, onAddToCart }: ProductInfoProps) {
  const hasDiscount = checkIsOfferActive({
    is_offer: product.is_offer,
    offer_price: product.offer_price,
    offer_start: product.offer_start || null,
    offer_end: product.offer_end || null,
  });

  const displayPrice =
    hasDiscount && product.offer_price ? product.offer_price : product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full px-2 py-5 bg-card rounded-2xl md:px-6">
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
          ${displayPrice.toFixed(2)}
        </span>

        {hasDiscount && (
          <div className="mb-1 flex flex-col items-start">
            <span className="text-lg text-gray-400 line-through">
              ${product.price.toFixed(2)}
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

      {/* ── SPACER (fills remaining height on desktop) ── */}
      {/*   <div className="flex-1" /> */}

      {/* ── CTA BUTTONS (sticky on mobile) ── */}
      <div className="bottom-0 bg-white static">
        {/* thin top separator only on mobile */}
        {/*  <div className="mb-3 h-px bg-gray-100 md:hidden" /> */}

        <div className="grid grid-cols-1 gap-3">
          {/* Add to Cart */}
          <button
            onClick={onAddToCart}
            disabled={!product.is_available}
            className={cn(
              "flex items-center justify-center gap-2.5 rounded-2xl px-3 py-3 text-sm font-bold tracking-wide transition-all duration-200",
              product.is_available
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/30 active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            Agregar al Carrito
          </button>

          {/* WhatsApp / Request */}
          <a
            href={`https://wa.me/59162557286?text=${encodeURIComponent(
              `Hola! Me interesa el producto: ${product.name}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-3 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" />
            Solicitar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
