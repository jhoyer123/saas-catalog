"use client";

import { ProductCatalog } from "@/types/product.types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Send } from "lucide-react";

interface ProductInfoProps {
  product: ProductCatalog;
  onAddToCart?: () => void;
  onRequestProduct?: () => void;
}

export function ProductInfo({
  product,
  onAddToCart,
  onRequestProduct,
}: ProductInfoProps) {
  const displayPrice =
    product.is_offer && product.offer_price
      ? product.offer_price
      : product.price;

  const hasDiscount = product.is_offer && product.offer_price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.offer_price!) / product.price) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Badge de disponibilidad */}
      <div>
        {product.is_available ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            No disponible
          </span>
        )}
      </div>
      {/* Título del producto */}
      <div>
        <h2 className="text-3xl font-bold font-poppins text-gray-900 md:text-4xl text-center">
          {product.name}
        </h2>
        {product.brand && (
          <p className="text-center font-poppins mt-2 text-lg text-gray-600">
            {product.brand}
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-4xl font-bold text-gray-900 font-inter">
          ${displayPrice.toFixed(2)}
        </span>

        {hasDiscount && (
          <>
            <span className="text-2xl text-gray-500 line-through font-inter">
              ${product.price.toFixed(2)}
            </span>
            <span className="font-inter rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
              -{discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* Descripción */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 font-poppins">
          Descripción
        </h2>
        <div
          className="prose prose-sm max-w-none text-gray-600 font-inter"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>

      {/* Botones de acción */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white w-full md:bg-transparent">
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!product.is_available}
            onClick={onAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Agregar al Carrito
          </Button>

          <a
            href={`https://wa.me/59162557286?text=${encodeURIComponent(`Hola! Me interesa el producto: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#0f52ba] hover:bg-[#0e48a3] text-gray-50 rounded-md px-4 py-1.5 transition-colors"
          >
            <Send className="h-5 w-5" />
            Solicitar
          </a>
        </div>

        {!product.is_available && (
          <p className="mt-3 text-center text-sm text-gray-500">
            Este producto no está disponible actualmente
          </p>
        )}
      </div>
    </div>
  );
}
