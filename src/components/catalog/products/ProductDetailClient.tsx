"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProductCatalog } from "@/types/product.types";
import Header from "@/components/catalog/header/Header";
import { ProductImageGallery } from "@/components/catalog/products/ProductImageGallery";
import { ProductInfo } from "@/components/catalog/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchPublicProductBySlug } from "@/lib/services/catalogServiceProduct";
import { useTiempoActual } from "@/hooks/catalog/useTiempoActual";
import { checkIsOfferActive } from "@/lib/helpers/validations";

interface ProductDetailClientProps {
  product: ProductCatalog;
  storeSlug: string;
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number?: string | null;
  };
}

export default function ProductDetailClient({
  product: initialProduct,
  store,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.getElementById("catalog-header");
    if (!header) return;
    const ro = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    ro.observe(header);
    setHeaderHeight(header.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const { data: product } = useQuery({
    queryKey: ["public-product", initialProduct.slug],
    queryFn: () => fetchPublicProductBySlug(initialProduct.slug),
    initialData: initialProduct,
    staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });

  const ahora = useTiempoActual(60_000);

  const isOfferActive = checkIsOfferActive(
    {
      is_offer: product.is_offer,
      offer_price: product.offer_price || null,
      offer_start: product.offer_start || null,
      offer_end: product.offer_end || null,
    },
    ahora,
  );

  const discountPercent =
    isOfferActive && product.offer_price
      ? Math.round(
          ((product.price - product.offer_price) / product.price) * 100,
        )
      : null;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Header store={store} />
      <div style={{ height: headerHeight }} />

      <div className="container mx-auto px-4 py-3">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <section className="container mx-auto px-2 pb-6">
        <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-7 justify-center items-start">
          <div
            className="lg:sticky lg:self-start"
            style={{ top: headerHeight + 16 }}
          >
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              discountPercent={discountPercent}
            />
          </div>
          <div>
            <ProductInfo
              product={product}
              whatssapNumber={store.whatsapp_number}
              isOfferActive={isOfferActive}
              discountPercent={discountPercent}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
