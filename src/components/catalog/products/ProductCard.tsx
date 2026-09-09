import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { ProductCatalogCard } from "@/types/product.types";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/cart/useCartStore";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPublicProductBySlug } from "@/lib/services/catalogServiceProduct";
import { OfferBadge } from "./offerBadge";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { AvailableBadge } from "./AvailableBadge";
import React from "react";
import { Whatsapp } from "@/components/icons/Whatsapp";
import {
  buildProductInquiryMessage,
  buildProductUrl,
  normalizeWhatsAppNumber,
} from "@/lib/helpers/whatsapp";

interface ProductCardProps {
  product: ProductCatalogCard;
  whatssapNumber?: string | null;
  isOfferActive: boolean; // Nuevo prop para indicar si la oferta está activa
  priority?: boolean;
  showButtons?: boolean; // Nuevo prop para controlar la visibilidad de los botones
}

export const ProductCard = React.memo(function ProductCard({
  product,
  whatssapNumber,
  isOfferActive,
  priority = false,
  showButtons = true,
}: ProductCardProps) {
  const { store_slug } = useParams<{ store_slug: string }>();

  // Dentro del componente para el prefetch
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["public-product", store_slug, product.slug],
      queryFn: () => fetchPublicProductBySlug(product.slug, store_slug),
      staleTime: 1000 * 60 * 5,
    });
  };

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  // Lógica para mostrar precio con descuento si la oferta está activa
  const hasDiscount = product.has_variants
    ? product.is_offer && product.is_offer
    : isOfferActive;
  const displayPrice = hasDiscount ? product.offer_price : product.price;

  // Agrega el producto al carrito desde la tarjeta
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // evita navegar al detalle
    e.stopPropagation();
    if (product.has_variants) {
      router.push(`/public/${store_slug}/${product.slug}`);
      return;
    }
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      link: buildProductUrl(store_slug, product.slug),
      image: getCatalogImageUrl(product.images[0]?.image_url),
      price: displayPrice!,
    });
    toast.success("Producto agregado al carrito", { position: "bottom-right" });
  };

  const telefono = whatssapNumber;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!telefono || displayPrice == null) return;
    const msg = encodeURIComponent(
      buildProductInquiryMessage({
        name: product.name,
        url: buildProductUrl(store_slug, product.slug),
        price: displayPrice,
      }),
    );
    window.open(
      `https://wa.me/${normalizeWhatsAppNumber(telefono)}?text=${msg}`,
      "_blank",
    );
  };

  const discountPercent =
    hasDiscount && product.offer_price
      ? Math.round(
          ((product.price - product.offer_price) / product.price) * 100,
        )
      : null;

  return (
    <div className="bg-card group relative flex h-full w-full flex-col justify-between border border-border shadow-sm transition-all duration-300 hover:shadow-md">
      {/* ───────── IMAGEN ───────── */}
      <Link
        href={`/public/${store_slug}/${product.slug}`}
        prefetch={false}
        onMouseEnter={handlePrefetch}
        className="relative block aspect-3/4 w-full overflow-hidden bg-gray-100"
      >
        <Image
          src={getCatalogImageUrl(product.images[0]?.image_url)}
          alt={product.name}
          fill
          quality={75}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          //sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          sizes="(max-width: 640px) 300px, (max-width: 1024px) 22vw, 18vw"
          priority={priority}
        />

        {/* Badge de descuento y disponibilidad */}
        {discountPercent && (
          <OfferBadge
            discountPercent={product.has_variants ? null : discountPercent}
          />
        )}
        {!product.is_available && <AvailableBadge />}

        {/* Botones hover — solo lg+ */}
        <div className="hidden lg:flex absolute bottom-2 right-2 z-10 flex-col gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {!product.has_variants && (
            <button
              onClick={handleWhatsApp}
              aria-label="Consultar por WhatsApp"
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-green-500 hover:text-white text-gray-600 transition-colors duration-200"
              data-umami-event="Contactar WhatsApp"
              data-umami-event-product={product.name}
            >
              <Whatsapp size={20} />
            </button>
          )}
          <button
            onClick={handleAddToCart}
            aria-label={
              product.has_variants
                ? `Elegir variante de ${product.name}`
                : `Agregar ${product.name} al carrito`
            }
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-gray-900 hover:text-white text-gray-600 transition-colors duration-200"
          >
            {product.has_variants ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </Link>

      {/* ───────── INFO ───────── */}
      <div className="flex flex-1 flex-col p-2">
        <Link href={`/public/${store_slug}/${product.slug}`} prefetch={false}>
          <h3 className="min-h-11 text-sm font-medium font-inter leading-snug text-gray-700 line-clamp-2 transition-colors hover:text-gray-900 sm:text-base lg:text-center">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 font-inter flex-wrap">
          {product.has_variants ? (
            <span className="text-md sm:text-xl font-bold text-background-foreground">
              Desde Bs. {displayPrice!.toFixed(2)}
            </span>
          ) : (
            <>
              <span className="text-md sm:text-xl font-bold text-background-foreground">
                Bs. {displayPrice!.toFixed(2)}
              </span>
              {hasDiscount && product.price !== displayPrice && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  Bs. {product.price.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Botones visibles — mobile/tablet (debajo del precio, sin hover) */}
        {showButtons && (
          <div className="flex lg:hidden gap-2 mt-2">
            {!product.has_variants && (
              <button
                onClick={handleWhatsApp}
                aria-label="Consultar por WhatsApp"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border bg-[#25D366] text-xs font-medium hover:bg-green-50 transition-colors text-white"
                data-umami-event="Pedir por WhatsApp un producto desde la tarjeta"
                data-umami-event-product={product.name}
              >
                <Whatsapp size={16} />
              </button>
            )}
            <button
              onClick={handleAddToCart}
              aria-label={
                product.has_variants
                  ? `Elegir variante de ${product.name}`
                  : `Agregar ${product.name} al carrito`
              }
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
            >
              {product.has_variants ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
