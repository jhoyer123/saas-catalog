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
  // NOTA DE RENDIMIENTO: Si este hook cambia cada segundo,
  // lo ideal es moverlo ADENTRO de <ProductCard /> para que no re-renderice este Slider.
  const ahora = useTiempoActual();

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-catalog-secondary/10 px-4 lg:px-8 pb-12 pt-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-catalog-secondary/45">
            También te puede gustar
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-catalog-secondary">
            Productos relacionados
          </h2>
        </div>
        <span className="hidden text-xs text-catalog-secondary/45 sm:block">
          Desliza para explorar
        </span>
      </div>

      <Carousel itemsCount={products.length}>
        {products.map((p) => (
          <div
            key={p.id}
            className="
              min-w-0
              h-full
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
