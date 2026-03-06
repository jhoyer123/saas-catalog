/**
 * CartItem — Fila individual dentro del carrito.
 *
 * Muestra: imagen, nombre, precio unitario, control de cantidad,
 * subtotal calculado automáticamente, y botón para eliminar.
 */

"use client";

import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { QuantityInput } from "@/components/cart/QuantityInput";
import type { CartItem as CartItemType } from "@/types/cart.types";
import { Button } from "../ui/button";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <div className="flex gap-3 rounded-xl bg-white p-1 shadow-sm border border-gray-100 items-center">
      {/* Imagen del producto */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info + controles */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        {/* Nombre y botón eliminar */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
            {item.name}
          </h3>
          <Button
            onClick={() => onRemove(item.id)}
            variant={"ghost"}
            aria-label={`Eliminar ${item.name} del carrito`}
            className="text-red-500/50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Precio unitario + cantidad + subtotal */}
        <div className="flex flex-col items-center justify-center gap-2 mt-1 sm:flex-row">
          <QuantityInput
            value={item.quantity}
            onChange={(qty) => onQuantityChange(item.id, qty)}
          />
          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            Bs. {subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
