"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ProductImageGallery } from "@/components/catalog/products/ProductImageGallery";
import { ProductInfo } from "@/components/catalog/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  fetchPublicBrands,
  fetchPublicProductBySlug,
} from "@/lib/services/catalogServiceProduct";
import { useTiempoActual } from "@/hooks/catalog/useTiempoActual";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { SkeletonDetailProduct } from "@/components/detailProduct/SkeletonDetailProduct";
import { getPublicStore } from "@/lib/actions/catalogActions";

interface ProductDetailClientProps {
  slugProd: string;
  storeSlug: string;
}

export default function ProductDetailClient({
  slugProd,
  storeSlug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(0);

  // 1. Recuperamos el store directo de la memoria compartida
  const { data: store } = useQuery({
    queryKey: ["public-store", storeSlug],
    queryFn: async () => {
      const data = await getPublicStore(storeSlug);
      return data;
    },
    staleTime: Infinity, // El store no cambia, así que nunca consideramos los datos como obsoletos
    gcTime: Infinity, // Mantener en caché indefinidamente
  });

  const { data: product } = useQuery({
    queryKey: ["public-product", storeSlug, slugProd],
    queryFn: () => fetchPublicProductBySlug(slugProd),
    staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["public-brands", storeSlug],
    queryFn: () => fetchPublicBrands(storeSlug),
    staleTime: Infinity, // El brand no cambia, así que nunca consideramos los datos como obsoletos
    gcTime: Infinity, // Mantener en caché indefinidamentes
  });

  useEffect(() => {
    // Si todavía no hay datos, no medimos nada porque está el Skeleton
    if (!store || !product) return;

    const header = document.getElementById("catalog-header");
    if (!header) return;

    const ro = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    ro.observe(header);

    // Medición inicial
    setHeaderHeight(header.offsetHeight);

    return () => ro.disconnect();
    // Agregamos [store, product] para que vuelva a correr cuando carguen los datos
  }, [store, product]);

  //hook para mostrar la oferta
  const ahora = useTiempoActual();

  const { isOfferActive, discountPercent } = useMemo(() => {
    if (!product) return { isOfferActive: false, discountPercent: null };
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

    return { isOfferActive, discountPercent };
  }, [product, ahora]);

  const productWithResolvedBrand = useMemo(() => {
    if (!product) return null;

    const resolvedBrandName =
      brands.find((brand) => brand.id === product.brand_id)?.name ?? null;

    return {
      ...product,
      brand: resolvedBrandName,
    };
  }, [product, brands]);

  const handleVolver = () => {
    // Si el historial tiene páginas registradas, va atrás.
    // Si no (porque recargó o entró directo), lo mandamos al catálogo de la tienda.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/public/${storeSlug}`);
    }
  };

  // Si TanStack Query todavía está armando los datos (casi imposible con hidratación, pero TypeScript lo exige)
  if (!productWithResolvedBrand || !store) return <SkeletonDetailProduct />;

  return (
    <main className="min-h-screen bg-catalog-primary">
      {/* <Header store={store} /> */}
      <div style={{ height: headerHeight }} />

      <div className="container mx-auto px-4 py-3 text-catalog-secondary">
        {/* Cambiamos el onClick para usar la función controlada */}
        <Button variant="ghost" onClick={handleVolver} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <section className="container mx-auto px-2 pb-6">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-7 justify-center items-start">
          <div
            className="lg:sticky lg:self-start"
            style={{ top: headerHeight + 16 }}
          >
            <ProductImageGallery
              images={productWithResolvedBrand.images.map((img) =>
                getCatalogImageUrl(img),
              )}
              productName={productWithResolvedBrand.name}
              discountPercent={discountPercent}
              is_available={productWithResolvedBrand.is_available}
            />
          </div>
          <div>
            <ProductInfo
              product={productWithResolvedBrand}
              whatssapNumber={store.whatsapp_number}
              isOfferActive={isOfferActive}
              discountPercent={discountPercent}
              slugProd={slugProd}
              store_slug={storeSlug}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
