import Link from "next/link";
import Image from "next/image";
import { ProductCatalog } from "@/types/product.types";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ProductCardProps {
  product: ProductCatalog;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice =
    product.is_offer && product.offer_price
      ? product.offer_price
      : product.price;

  const hasDiscount = product.is_offer && product.offer_price;

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Badge de oferta */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 z-10 bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded">
          OFERTA
        </div>
      )}

      {/* Imagen del producto */}
      <Link
        href={`/public/catalog/${product.slug}`}
        className="relative aspect-3/4 w-full overflow-hidden bg-gray-100"
      >
        <Image
          src={product.images[0] || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Contenido de la tarjeta */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        {/* Nombre y marca */}
        <div className="flex-1">
          <Link href={`/public/catalog/${product.slug}`}>
            <h3 className="font-medium font-poppins text-gray-900 line-clamp-2 hover:text-gray-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.brand && (
            <p className="text-sm text-gray-500 mt-1 font-inter">{product.brand}</p>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-inter font-bold text-gray-900">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-inter text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 pt-2">
          <Link href={`/public/catalog/${product.slug}`} className="w-full">
            <Button variant="outline" className="w-full">
              Ver Detalles
            </Button>
          </Link>
          <a
            href={`https://wa.me/59162557286?text=${encodeURIComponent(`Hola! Me interesa el producto: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#0f52ba] hover:bg-[#0e48a3] text-gray-50 rounded-md px-4 py-2 transition-colors"
          >
            <Send className="h-5 w-5" />
            Solicitar
          </a>
        </div>
      </div>
    </div>
  );
}
