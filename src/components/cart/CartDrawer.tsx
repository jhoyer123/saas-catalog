/**
 * CartDrawer — Panel lateral del carrito de compras.
 *
 * Se abre como un Sheet (slide-in) desde la derecha.
 * Contiene: lista de items, estado vacío, y resumen de totales.
 *
 * Usa el store de Zustand para leer/modificar el carrito.
 */

"use client";

import { Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { CartItem } from "@/components/cart/CartItem";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartSummary } from "@/components/cart/CartSummary";
import { DialogDescription } from "../ui/dialog";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber?: string | null;
}

export function CartDrawer({
  open,
  onOpenChange,
  whatsappNumber,
}: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  // Derivados reactivos desde items
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const priceTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  /** Genera texto resumen del pedido para WhatsApp */
  const cartSummaryText = items
    .map(
      (item) =>
        `• ${item.name} x${item.quantity} — Bs. ${(item.price * item.quantity).toFixed(2)} - ${item.link}`,
    )
    .join("\n");

  const isEmpty = items.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col p-0 w-full sm:max-w-md"
      >
        {/* ── Encabezado ── */}
        <SheetHeader className="flex flex-col items-center justify-between border-b px-4 py-3">
          {/* Botón cerrar */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar carrito"
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Botón vaciar — solo visible si hay items */}
            {!isEmpty ? (
              <button
                onClick={clearCart}
                aria-label="Vaciar carrito"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs 
                         font-medium text-gray-400 transition-colors 
                         hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vaciar
              </button>
            ) : (
              <div className="w-14" />
            )}
          </div>

          <div className="flex flex-col">
            <SheetTitle className="text-lg">Carrito de Compras</SheetTitle>
            <DialogDescription>
              ({itemCount}) Productos agregados
            </DialogDescription>
          </div>
        </SheetHeader>

        {/* ── Lista de productos o estado vacío ── */}
        {isEmpty ? (
          <CartEmptyState />
        ) : (
          <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3 md:px-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={setQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}

        {/* ── Resumen y botón de acción ── */}
        {!isEmpty && (
          <CartSummary
            totalItems={itemCount}
            totalPrice={priceTotal}
            whatsappNumber={whatsappNumber}
            cartSummaryText={cartSummaryText}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
