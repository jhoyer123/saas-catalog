/**
 * Store global del carrito de compras con Zustand.
 *
 * Responsabilidades:
 * - Agregar productos (si ya existe, suma cantidad).
 * - Actualizar cantidad de un item (mínimo 1).
 * - Eliminar un item del carrito.
 * - Vaciar todo el carrito.
 * - Calcular totales derivados (cantidad total, precio total).
 *
 * Persistencia: se guarda en localStorage para que sobreviva recargas.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart.types";

/* ─── Interfaz del store ─── */
interface CartState {
  items: CartItem[];

  /** Agrega un producto. Si ya existe (mismo id), incrementa cantidad en 1. */
  addItem: (product: Omit<CartItem, "quantity">) => void;

  /** Elimina completamente un item del carrito. */
  removeItem: (id: string) => void;

  /** Establece la cantidad exacta de un item (mínimo 1). */
  setQuantity: (id: string, quantity: number) => void;

  /** Vacía completamente el carrito. */
  clearCart: () => void;

  /** Cantidad total de unidades en el carrito. */
  totalItems: () => number;

  /** Precio total con todas las cantidades. */
  totalPrice: () => number;
}

/* ─── Implementación ─── */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }

          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      setQuantity: (id, quantity) => {
        // Solo números naturales >= 1
        const safeQty = Math.max(1, Math.floor(quantity));

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: safeQty } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
    }),
    {
      name: "cart-storage", // clave en localStorage
    },
  ),
);
