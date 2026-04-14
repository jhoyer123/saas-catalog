"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPublicProducts } from "@/lib/services/catalogServiceProduct";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { Banner } from "@/types/catalog/catalog.types";
import { InputSearch } from "./header/InputSearch";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";
import { BrandCatalog } from "@/types/brand.types";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import CatalogNotAvailable from "./CatalogNotAvailable";
import { checkIsPlanActive } from "@/lib/helpers/validations";

// Hook reutilizable para medir altura
function useElementHeight(id: string) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const update = () => setHeight(el.offsetHeight);

    const ro = new ResizeObserver(update);
    ro.observe(el);

    update();

    return () => ro.disconnect();
  }, [id]);

  return height;
}

interface CatalogClientProps {
  categories: { id: string; name: string }[];
  brands: BrandCatalog[];
  banners: Banner[];
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number: string | null;
    updated_at: string; // Agregado para el cache busting
    plan_expires_at: string | null; // Agregado para validación de plan
    is_active: boolean; // Agregado para validar si la tienda está activa
  };
}

export default function CatalogClient({
  categories,
  brands,
  banners,
  store,
}: CatalogClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const headerHeight = useElementHeight("catalog-header");
  const inputBarHeight = useElementHeight("catalog-input-bar");

  const { filters } = useProductFilter();

  // Evitar múltiples scrolls
  const filterKey = JSON.stringify(filters);

  const isMounted = useRef(false);

  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    // Primera vez no hacer nada
    if (!isMounted.current) {
      isMounted.current = true;
      prevFilterKey.current = filterKey;
      return;
    }

    // Si no cambiaron filtros no hacer scroll
    if (prevFilterKey.current === filterKey) return;

    prevFilterKey.current = filterKey;

    const section = document.getElementById("catalog-products");
    if (!section) return;

    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      inputBarHeight;

    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, [filterKey, headerHeight, inputBarHeight]);

  // Normalización para queryKey estable
  const normalize = (v: unknown) => v ?? "";

  const search = filters.search;
  const category = filters.category ?? "";
  const brand = filters.brand ?? "";
  const minPrice = filters.minPrice !== null ? String(filters.minPrice) : "";
  const maxPrice = filters.maxPrice !== null ? String(filters.maxPrice) : "";
  const onlyOffers = filters.isOffer === true ? "true" : "";
  const sort = filters.sortBy ?? "";
  const pageNum = filters.page;

  const productQueryKey = [
    "public-products",
    store.slug,
    normalize(search),
    normalize(category),
    normalize(brand),
    normalize(minPrice),
    normalize(maxPrice),
    normalize(onlyOffers),
    normalize(sort),
    pageNum,
  ] as const;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: productQueryKey,
    queryFn: () =>
      fetchPublicProducts({
        storeSlug: store.slug,
        search: search || undefined,
        category: category || undefined,
        brand: brand || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        onlyOffers: onlyOffers || undefined,
        sort:
          (sort as "price_asc" | "price_desc" | "newest" | "display_order") ||
          undefined,
        page: pageNum,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const hasBanners = banners.length > 0;
  //validar si el plan está activo
  const [isBlocked, setIsBlocked] = useState(() => !checkIsPlanActive(store));

  useEffect(() => {
    if (!checkIsPlanActive(store)) {
      setIsBlocked(true);
    }
  }, [store]);

  if (isBlocked) {
    return <CatalogNotAvailable handle={store.slug} />;
  }

  return (
    <main className="min-h-screen  bg-catalog-primary pb-6">
      {/*  <Header store={store} /> */}

      <div
        id="catalog-input-bar"
        className="bg-catalog-primary py-2 sticky z-20 top-0 h-full w-full flex items-center justify-center lg:hidden"
        style={{ top: headerHeight }}
      >
        <InputSearch onOpenFilters={() => setMobileFiltersOpen(true)} />
      </div>

      <div style={{ height: headerHeight }} />

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        categories={categories}
        brands={brands}
      />

      {hasBanners && (
        <div className="max-w-7xl w-full mx-auto py-3 px-2">
          <div className="flex gap-3 items-center justify-center">
            <aside className="hidden lg:block w-90 shrink-0">
              <ProductFilterControls categories={categories} brands={brands} />
            </aside>

            <div className="flex-1">
              <HeroSection
                banners={banners.map((b) => ({
                  ...b,
                  image_url: getCatalogImageUrl(b.image_url),
                }))}
              />
            </div>
          </div>
        </div>
      )}

      <section
        id="catalog-products"
        className="container w-full h-full max-w-7xl mx-auto px-1"
      >
        <div
          className={`flex h-full ${hasBanners ? "py-0 gap-6" : "py-6 gap-3"}`}
        >
          {!hasBanners && (
            <aside
              className="hidden lg:block w-64 xl:w-80 shrink-0 sticky self-start"
              style={{ top: headerHeight }}
            >
              <ProductFilterControls categories={categories} brands={brands} />
            </aside>
          )}

          <div className="flex-1">
            <div className="pb-6 flex flex-col items-start md:pt-3 md:flex-row md:items-center md:justify-between w-full px-4">
              <h1 className="text-xl font-bold font-poppins text-catalog-secondary/95 md:text-2xl">
                Catálogo de Productos
              </h1>
              <p className="text-sm font-inter text-catalog-secondary/80">
                {total} productos encontrados
              </p>
            </div>

            {/* Loader mejorado */}
            {isFetching && !isLoading && (
              <div className="h-0.5 w-full overflow-hidden mb-2 bg-border rounded-full">
                <div className="h-full w-2/5 bg-primary/50 rounded-full catalog-loading-bar" />
              </div>
            )}

            <div
              className={`transition-opacity duration-200 ${
                isFetching && !isLoading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <ProductGrid
                products={products}
                isLoading={isLoading}
                hasBanners={hasBanners}
                whatssapNumber={store.whatsapp_number}
              />
            </div>

            {totalPages > 0 && (
              <ProductPagination
                totalPages={totalPages}
                pageSize={12}
                total={total}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
