"use client";

import Carousel from "@/components/ui/Carousel";
import { ProductCard } from "./ProductCard";
import type { ProductCatalogCard } from "@/types/product.types";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import { useTiempoActual } from "@/hooks/catalog/useTiempoActual";

interface Props {
  products: ProductCatalogCard[];
}

export default function RelatedProductsSlider({ products }: Props) {
  if (products.length === 0) return null;

  // NOTA DE RENDIMIENTO: Si este hook cambia cada segundo,
  // lo ideal es moverlo ADENTRO de <ProductCard /> para que no re-renderice este Slider.
  const ahora = useTiempoActual();

  return (
    <section className="mx-auto max-w-6xl px-4 pt-2 pb-8">
      <h2
        className="
          mb-4 text-center
          text-lg font-semibold
          text-catalog-secondary/80
        "
      >
        Productos relacionados
      </h2>

      <Carousel itemsCount={products.length}>
        {products.map((p) => (
          <div
            key={p.id}
            className="
              min-w-0
              pl-4
              flex-[0_0_75%]
              sm:flex-[0_0_50%]
              lg:flex-[0_0_33.333%]
              transform-gpu 
              will-change-transform
            "
            style={{ backfaceVisibility: "hidden" }} // Forzar renderizado por GPU en iOS/Android
          >
            <ProductCard
              product={p}
              isOfferActive={checkIsOfferActive(
                {
                  is_offer: p.is_offer,
                  offer_price: p.offer_price,
                  offer_start: p.offer_start,
                  offer_end: p.offer_end,
                },
                ahora,
              )}
              priority={false}
              showButtons={false}
            />
          </div>
        ))}
      </Carousel>
    </section>
  );
}
