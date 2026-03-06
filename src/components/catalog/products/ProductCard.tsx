import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { ProductCatalogCard } from "@/types/product.types";
import { useParams } from "next/navigation";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductCatalogCard;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const hasDiscount = product.is_offer_active;

  const displayPrice = hasDiscount ? product.offer_price : product.price;
  const { store_slug } = useParams<{ store_slug: string }>();

  /** Agrega el producto al carrito desde la tarjeta */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // evita navegar al detalle
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      image: product.images[0]?.image_url || "/images/placeholder.png",
      price: displayPrice!,
    });
    toast.success("Producto agregado al carrito", { position: "top-right" });
  };

  return (
    <div className="flex flex-col justify-between group relative w-full bg-card hover:shadow-md transition-all duration-300  border border-border shadow-sm">
      {/* ───────── IMAGEN ───────── */}
      <Link
        href={`/public/${store_slug}/${product.slug}`}
        className="relative block aspect-3/4 w-full overflow-hidden bg-gray-300"
      >
        <Image
          src={product.images[0]?.image_url || "/images/placeholder.png"}
          alt={product.name}
          fill // ← fill en vez de width/height
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      {/* ───────── INFO ───────── */}
      <div className="p-2">
        {/* Nombre */}
        <Link href={`/public/${store_slug}/${product.slug}`}>
          <h3 className="text-sm sm:text-base md:text-lg font-medium font-inter text-gray-700 leading-snug line-clamp-2 wrap-break-word hover:text-gray-900 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 font-inter flex-wrap">
          {/* Precio Actual */}
          <span className="text-md sm:text-xl font-bold text-background-foreground">
            Bs. {displayPrice!.toFixed(2)}
          </span>

          {/* Precio de Oferta (Tachado) */}
          {hasDiscount && product.price !== displayPrice && (
            <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
              Bs. {product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Botón agregar al carrito */}
        <Button
          onClick={handleAddToCart}
          aria-label={`Agregar ${product.name} al carrito`}
          className="mt-2 flex w-full items-center justify-center gap-4 rounded-lg text-xs font-semibol active:scale-[0.97] cursor-pointer"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>
    </div>
  );
}
