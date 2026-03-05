import Link from "next/link";
import Image from "next/image";
import { ProductCatalogCard } from "@/types/product.types";
import { useParams } from "next/navigation";
import { checkIsOfferActive } from "@/lib/helpers/validations";

interface ProductCardProps {
  product: ProductCatalogCard;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = checkIsOfferActive({
    is_offer: product.is_offer,
    offer_price: product.offer_price,
    offer_start: product.offer_start,
    offer_end: product.offer_end,
  });

  const displayPrice =
    hasDiscount && product.offer_price ? product.offer_price : product.price;
  const { store_slug } = useParams<{ store_slug: string }>();

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
      <div className="px-4 pb-3 pt-2">
        {/* Nombre */}
        <Link href={`/public/${store_slug}/${product.slug}`}>
          <h3 className="text-sm sm:text-base md:text-lg font-medium font-inter text-gray-700 leading-snug line-clamp-2 wrap-break-word hover:text-gray-900 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline justify-center gap-2 font-inter flex-wrap">
          {/* Precio Actual */}
          <span className="text-md sm:text-xl font-bold text-background-foreground">
            Bs. {displayPrice.toFixed(2)}
          </span>

          {/* Precio de Oferta (Tachado) */}
          {hasDiscount && product.price !== displayPrice && (
            <span className="text-sm sm:text-base text-muted-foreground line-through font-medium">
              Bs. {product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
