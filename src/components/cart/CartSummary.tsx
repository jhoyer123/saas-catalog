/**
 * CartSummary — Resumen de totales del carrito.
 *
 * Muestra la cantidad de items, el precio total calculado
 * y el botón principal de acción (WhatsApp / checkout futuro).
 */

"use client";

import { MessageCircle } from "lucide-react";

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
  whatsappNumber?: string | null;
  cartSummaryText: string;
}

export function CartSummary({
  totalItems,
  totalPrice,
  whatsappNumber,
  cartSummaryText,
}: CartSummaryProps) {
  const handleWhatsApp = () => {
    if (!whatsappNumber) return;

    const message = encodeURIComponent(
      `¡Hola! Me gustaría hacer un pedido:\n\n${cartSummaryText}\n\n` +
        `Total: Bs. ${totalPrice.toFixed(2)}`,
    );

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
      {/* Línea de total */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          Total ({totalItems} {totalItems === 1 ? "producto" : "productos"})
        </span>
        <span className="text-lg font-bold text-gray-900">
          Bs. {totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Botón de acción - WhatsApp */}
      {whatsappNumber && (
        <button
          onClick={handleWhatsApp}
          disabled={totalItems === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl 
                     bg-green-600 px-4 py-3 text-sm font-bold text-white 
                     shadow-lg shadow-green-600/25 transition-all duration-200 
                     hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/30 
                     active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          data-umami-event="Enviar pedido  al WhatsApp desde el carrito"
          data-umami-event-total={totalPrice}
        >
          <MessageCircle className="h-5 w-5" />
          Enviar pedido por WhatsApp
        </button>
      )}
    </div>
  );
}
