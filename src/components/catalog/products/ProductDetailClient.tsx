"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ProductImageGallery } from "@/components/catalog/products/ProductImageGallery";
import {
  DescriptionAccordion,
  ProductInfo,
} from "@/components/catalog/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  fetchPublicBrands,
  fetchPublicProductBySlug,
  fetchRelatedProducts,
} from "@/lib/services/catalogServiceProduct";
import { useTiempoActual } from "@/hooks/catalog/useTiempoActual";
import { checkIsOfferActive } from "@/lib/helpers/validations";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { SkeletonDetailProduct } from "@/components/detailProduct/SkeletonDetailProduct";
import { getPublicStore } from "@/lib/actions/catalogActions";
import RelatedProductsSlider from "./RelatedProductsSlider";
import {
  buildVisualSignature,
  findVariant,
} from "../lib/helpers/resolveVariant";

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

  //Recuperamos el store directo de la memoria compartida
  const { data: store } = useQuery({
    queryKey: ["public-store", storeSlug],
    queryFn: async () => {
      const data = await getPublicStore(storeSlug);
      return data;
    },
    staleTime: Infinity, // El store no cambia, así que nunca consideramos los datos como obsoletos
    gcTime: Infinity, // Mantener en caché indefinidamente
  });
  //Recuperamos el producto directo
  const { data: product } = useQuery({
    queryKey: ["public-product", storeSlug, slugProd],
    queryFn: () => fetchPublicProductBySlug(slugProd, storeSlug),
    staleTime: 1000 * 60 * 10, // Los datos se consideran frescos por 10 minutos
    //refetchOnMount: "always",
    //refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });

  //Recuperamos las marcas para resolver el nombre de la marca del producto (OJO AQUI PODRIAMOS SIMPLEMTE TRAER DEL UNESTABLE CACHE)
  const { data: brands = [] } = useQuery({
    queryKey: ["public-brands", storeSlug],
    queryFn: () => fetchPublicBrands(storeSlug),
    staleTime: Infinity, // El brand no cambia, así que nunca consideramos los datos como obsoletos
    gcTime: Infinity, // Mantener en caché indefinidamentes
  });
  //Recuperamos productos relacionados (mismo category_id, distinto id)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: [
      "related-products",
      storeSlug,
      product?.category_id,
      product?.id,
    ],
    queryFn: () =>
      fetchRelatedProducts(storeSlug, product!.category_id!, product!.id),
    enabled: !!product, // Solo correr esta query si ya tenemos el producto (porque necesitamos su category_id)
    staleTime: 1000 * 60 * 10, // Los datos se consideran frescos por 10 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });

  useEffect(() => {
    // Si todavía no hay datos, no medimos nada porque está el Skeleton
    if (!store || !product) return;

    const header = document.getElementById("catalog-header");
    if (!header) return;

    const ro = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    ro.observe(header);

    const frame = requestAnimationFrame(() =>
      setHeaderHeight(header.offsetHeight),
    );

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
    // Agregamos [store, product] para que vuelva a correr cuando carguen los datos
  }, [store, product]);

  //hook para mostrar la oferta
  const ahora = useTiempoActual();

  const [selection, setSelection] = useState<{
    productId: string | null;
    options: Record<string, string>;
  }>({ productId: null, options: {} });
  const productId = product?.id;
  const selectedOptions = useMemo(
    () =>
      productId && selection.productId === productId ? selection.options : {},
    [productId, selection],
  );
  const setSelectedOptions: Dispatch<SetStateAction<Record<string, string>>> = (
    nextOptions,
  ) => {
    setSelection((current) => {
      const currentOptions =
        current.productId === productId ? current.options : {};
      const options =
        typeof nextOptions === "function"
          ? nextOptions(currentOptions)
          : nextOptions;
      return { productId: productId ?? null, options };
    });
  };

  const currentVariant = useMemo(() => {
    if (!product?.has_variants) return undefined;
    return findVariant(
      product.variants,
      selectedOptions,
      product.option_types.map((optionType) => optionType.id),
    );
  }, [product, selectedOptions]);

  // DESPUÉS
  const {
    isOfferActive,
    discountPercent,
    effectivePrice,
    effectiveOfferPrice,
  } = useMemo(() => {
    if (!product) {
      return {
        isOfferActive: false,
        discountPercent: null,
        effectivePrice: 0,
        effectiveOfferPrice: null,
      };
    }

    if (product.has_variants) {
      if (!currentVariant) {
        return {
          isOfferActive: false,
          discountPercent: null,
          effectivePrice: null,
          effectiveOfferPrice: null,
        };
      }

      const price = currentVariant.price;
      const offerPrice = currentVariant?.offer_price ?? null;
      const active = offerPrice != null;
      const discount = active
        ? Math.round(((price - offerPrice) / price) * 100)
        : null;
      return {
        isOfferActive: active,
        discountPercent: discount,
        effectivePrice: price,
        effectiveOfferPrice: offerPrice,
      };
    }

    const active = checkIsOfferActive(
      {
        is_offer: product.is_offer,
        offer_price: product.offer_price || null,
        offer_start: product.offer_start || null,
        offer_end: product.offer_end || null,
      },
      ahora,
    );
    const discount =
      active && product.offer_price
        ? Math.round(
            ((product.price - product.offer_price) / product.price) * 100,
          )
        : null;
    return {
      isOfferActive: active,
      discountPercent: discount,
      effectivePrice: product.price,
      effectiveOfferPrice: product.offer_price,
    };
  }, [product, ahora, currentVariant]);

  const productWithResolvedBrand = useMemo(() => {
    if (!product) return null;

    const resolvedBrandName =
      brands.find((brand) => brand.id === product.brand_id)?.name ?? null;

    return {
      ...product,
      brand_name: resolvedBrandName ? resolvedBrandName : null,
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

  // AGREGAR
  const galleryImages = useMemo(() => {
    if (!productWithResolvedBrand?.has_variants) {
      return (
        productWithResolvedBrand?.images.map((img) =>
          getCatalogImageUrl(img),
        ) ?? []
      );
    }
    const visualTypes = productWithResolvedBrand.option_types.filter(
      (optionType) => optionType.is_visual,
    );
    const visualSignature = buildVisualSignature(
      selectedOptions,
      visualTypes.map((optionType) => optionType.id),
    );
    const visualImages = visualSignature
      ? productWithResolvedBrand.visual_images_by_signature?.[visualSignature]
      : undefined;

    return visualImages?.length
      ? visualImages.map((img) => getCatalogImageUrl(img))
      : productWithResolvedBrand.images.map((img) => getCatalogImageUrl(img));
  }, [productWithResolvedBrand, selectedOptions]);
  // Si TanStack Query todavía está armando los datos (casi imposible con hidratación, pero TypeScript lo exige)
  if (!productWithResolvedBrand || !store) return <SkeletonDetailProduct />;

  return (
    <main className="min-h-screen bg-catalog-primary">
      {/* <Header store={store} /> */}
      <div style={{ height: headerHeight }} />
      {/* buton regresar */}
      <div className="container mx-auto px-1 md:px-4 pb-2 pt-4 text-catalog-secondary">
        <Button
          onClick={handleVolver}
          className="rounded-full border border-catalog-secondary/15 bg-transparent text-catalog-secondary/70 shadow-none transition-colors hover:bg-catalog-secondary hover:text-catalog-primary focus:bg-catalog-secondary focus:text-catalog-primary active:bg-catalog-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      {/* imagen + detalles del producto */}
      <section className="container mx-auto max-w-7xl px-1 md:px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12">
          {/* Galeria y descripcion permanecen visibles mientras se consulta la variante. */}
          <div
            className="lg:sticky lg:self-start"
            style={{ top: headerHeight + 16 }}
          >
            <ProductImageGallery
              key={galleryImages.join("|")}
              images={galleryImages}
              productName={productWithResolvedBrand.name}
              discountPercent={discountPercent}
              is_available={
                productWithResolvedBrand.has_variants
                  ? (currentVariant?.is_available ?? true)
                  : productWithResolvedBrand.is_available
              }
            />
            <div className="hidden lg:block">
              <DescriptionAccordion
                description={productWithResolvedBrand.description}
              />
            </div>
          </div>
          {/* El panel de compra se desplaza solo cuando las variantes exceden el viewport. */}
          <div className="min-h-0 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
            <ProductInfo
              product={productWithResolvedBrand}
              whatssapNumber={store.whatsapp_number}
              isOfferActive={isOfferActive}
              discountPercent={discountPercent}
              effectivePrice={effectivePrice}
              effectiveOfferPrice={effectiveOfferPrice}
              selectedImage={galleryImages[0]}
              currentVariant={currentVariant}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              slugProd={slugProd}
              store_slug={storeSlug}
            />
          </div>
        </div>
      </section>
      {/* products related section*/}
      {relatedProducts.length > 0 && (
        <RelatedProductsSlider products={relatedProducts} />
      )}
    </main>
  );
}
