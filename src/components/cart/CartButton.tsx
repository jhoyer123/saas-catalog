/**
 * CartButton — Botón que abre el carrito desde el header.
 *
 * Muestra un badge con la cantidad total de items.
 * Usa un efecto de hydration-safe para evitar mismatch de SSR.
 */

"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface CartButtonProps {
  whatsappNumber?: string | null;
}

export function CartButton({ whatsappNumber }: CartButtonProps) {
  const [open, setOpen] = useState(false);

  // Derivamos el conteo directamente de items para que sea reactivo
  const count = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  // Hydration-safe: solo muestra el badge después del primer render en cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCount = mounted ? count : 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Abrir carrito de compras"
        className="relative"
      >
        <ShoppingCart className="h-5 w-5" />

        {/* Badge de cantidad */}
        {displayCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center 
                       rounded-full bg-gray-900 text-[10px] font-bold text-white 
                       shadow-sm"
          >
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </Button>

      <CartDrawer
        open={open}
        onOpenChange={setOpen}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
