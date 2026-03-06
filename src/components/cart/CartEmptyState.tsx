/**
 * CartEmptyState — Estado vacío del carrito.
 *
 * Se muestra cuando no hay productos en el carrito.
 * Diseño minimalista con icono y mensaje claro.
 */

"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";

export function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4">
        <ShoppingCart className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-base font-medium text-gray-600">
        Tu carrito está vacío
      </p>
      <p className="text-sm text-gray-400">
        Agrega productos para comenzar tu pedido
      </p>
    </div>
  );
}
