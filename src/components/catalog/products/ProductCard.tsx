import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { ProductCatalogCard } from "@/types/product.types";
import { useParams } from "next/navigation";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPublicProductBySlug } from "@/lib/services/catalogServiceProduct";
import { OfferBadge } from "./offerBadge";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { AvailableBadge } from "./AvailableBadge";
import React from "react";

interface ProductCardProps {
  product: ProductCatalogCard;
  whatssapNumber?: string | null;
  isOfferActive: boolean; // Nuevo prop para indicar si la oferta está activa
  priority?: boolean;
}
export const ProductCard = React.memo(function ProductCard({
  product,
  whatssapNumber,
  isOfferActive,
  priority = false,
}: ProductCardProps) {
  // Dentro del componente para el prefetch
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["public-product", store_slug, product.slug],
      queryFn: () => fetchPublicProductBySlug(product.slug),
      staleTime: 1000 * 60 * 5,
    });
  };

  const addItem = useCartStore((s) => s.addItem);

  // Lógica para mostrar precio con descuento si la oferta está activa
  const hasDiscount = isOfferActive;
  const displayPrice = hasDiscount ? product.offer_price : product.price;

  const { store_slug } = useParams<{ store_slug: string }>();

  // Agrega el producto al carrito desde la tarjeta
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // evita navegar al detalle
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      image: getCatalogImageUrl(product.images[0]?.image_url),
      price: displayPrice!,
    });
    toast.success("Producto agregado al carrito", { position: "bottom-right" });
  };

  const telefono = whatssapNumber;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // ajusta el número si lo tienes disponible en el store
    const msg = encodeURIComponent(
      `¡Hola! Me gustaría hacer un pedido:

De este producto:
${product.name}
Precio: Bs. ${displayPrice!.toFixed(2)}

¿Está disponible? Me gustaría más información`,
    );
    window.open(`https://wa.me/${telefono}?text=${msg}`, "_blank");
  };

  const discountPercent =
    hasDiscount && product.offer_price
      ? Math.round(
          ((product.price - product.offer_price) / product.price) * 100,
        )
      : null;

  const WhatsAppIcon = () => (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  return (
    <div className="bg-card flex flex-col justify-between group relative w-full hover:shadow-md transition-all duration-300 border border-border shadow-sm">
      {/* ───────── IMAGEN ───────── */}
      <Link
        href={`/public/${store_slug}/${product.slug}`}
        prefetch={false}
        //onMouseEnter={handlePrefetch}  // ← agregar prefetch en hover
        onTouchStart={handlePrefetch}
        className="relative block aspect-3/4 w-full overflow-hidden bg-gray-100"
      >
        <Image
          src={getCatalogImageUrl(product.images[0]?.image_url)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />

        {discountPercent && <OfferBadge discountPercent={discountPercent} />}
        {!product.is_available && <AvailableBadge />}

        {/* Botones hover — solo lg+ */}
        <div className="hidden lg:flex absolute bottom-2 right-2 z-10 flex-col gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleWhatsApp}
            aria-label="Consultar por WhatsApp"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-green-500 hover:text-white text-gray-600 transition-colors duration-200"
            data-umami-event="Contactar WhatsApp"
            data-umami-event-product={product.name}
          >
            <WhatsAppIcon />
          </button>
          <button
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-900 hover:text-white text-gray-600 transition-colors duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* ───────── INFO ───────── */}
      <div className="p-2">
        <Link href={`/public/${store_slug}/${product.slug}`} prefetch={false}>
          <h3 className="text-sm sm:text-base font-medium font-inter text-gray-700 leading-snug line-clamp-2 hover:text-gray-900 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 font-inter flex-wrap">
          <span className="text-md sm:text-xl font-bold text-background-foreground">
            Bs. {displayPrice!.toFixed(2)}
          </span>
          {hasDiscount && product.price !== displayPrice && (
            <span className="text-sm text-muted-foreground line-through font-medium">
              Bs. {product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Botones visibles — mobile/tablet (debajo del precio, sin hover) */}
        <div className="flex lg:hidden gap-2 mt-2">
          <button
            onClick={handleWhatsApp}
            aria-label="Consultar por WhatsApp"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors"
            data-umami-event="Contactar WhatsApp"
            data-umami-event-product={product.name}
          >
            <WhatsAppIcon />
          </button>
          <button
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
