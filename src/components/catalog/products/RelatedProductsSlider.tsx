"use client";

import Carousel from "@/components/ui/Carousel";
import { ProductCard } from "./ProductCard";
import type { ProductCatalogCard } from "@/types/product.types";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import { useTiempoActual } from "@/hooks/catalog/useTiempoActual";
import { useEffect, useMemo, useState } from "react";

interface Props {
  products: ProductCatalogCard[];
}

export default function RelatedProductsSlider({ products }: Props) {
  if (products.length === 0) return null;

  //cuidado con el performance
  const ahora = useTiempoActual();
  const [maxVisible, setMaxVisible] = useState(1);

  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");

    const updateMaxVisible = () => {
      if (lg.matches) {
        setMaxVisible(3);
      } else if (md.matches) {
        setMaxVisible(2);
      } else {
        setMaxVisible(1);
      }
    };

    updateMaxVisible();
    md.addEventListener("change", updateMaxVisible);
    lg.addEventListener("change", updateMaxVisible);

    return () => {
      md.removeEventListener("change", updateMaxVisible);
      lg.removeEventListener("change", updateMaxVisible);
    };
  }, []);

  const scrollEnabled = useMemo(
    () => products.length > maxVisible,
    [products.length, maxVisible],
  );

  return (
    <section className="container mx-auto px-4 pt-2 pb-8 lg:px-2 lg:pt-4 lg:pb-12">
      <h2 className="text-[17px] md:text-lg mb-4 font-poppins text-center text-catalog-secondary/70">
        Productos relacionados
      </h2>
      <Carousel scrollEnabled={scrollEnabled}>
        {products.map((p) => (
          <div key={p.id} className="w-full h-full">
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
