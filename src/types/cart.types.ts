/**
 * Tipos para el carrito de compras.
 * Solo almacenamos la información mínima necesaria de cada producto.
 */

/** Producto dentro del carrito — solo datos esenciales */
export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number; // precio unitario (ya con oferta aplicada si corresponde)
  quantity: number; // siempre >= 1
}
