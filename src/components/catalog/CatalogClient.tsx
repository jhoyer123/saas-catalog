"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchPublicProducts } from "@/lib/services/catalogServiceProduct";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { Banner, StoreCatalog } from "@/types/catalog/catalog.types";
import { InputSearch } from "./header/InputSearch";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";
import { BrandCatalog } from "@/types/brand.types";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import CategoryPills from "./category/CategoryPills";

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
  categories: { id: string; name: string; slug: string }[];
  brands: BrandCatalog[];
  banners: Banner[];
  store: StoreCatalog;
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

  const filterKey = JSON.stringify(filters);
  const isMounted = useRef(false);
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      prevFilterKey.current = filterKey;
      return;
    }
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    const section = document.getElementById("catalog-products");
    if (!section) return;
    const top =
      section.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      inputBarHeight;
    requestAnimationFrame(() => window.scrollTo({ top, behavior: "smooth" }));
  }, [filterKey, headerHeight, inputBarHeight]);

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
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    placeholderData: keepPreviousData,
  });
  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;
  const hasBanners = banners.length > 0;

  return (
    <main className="min-h-screen w-full bg-catalog-primary">
      {/* Barra de búsqueda sticky — mobile */}
      <div
        id="catalog-input-bar"
        className="bg-catalog-primary/95 backdrop-blur-sm py-2.5 sticky z-20 top-0 w-full flex items-center justify-center border-b border-border/40 lg:hidden"
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

      <div className="w-full h-full px-1 md:px-2 2xl:px-1 flex gap-2 items-start relative">
        <aside
          className="hidden lg:block w-70 xl:w-80 2xl:w-90 shrink-0 sticky"
          style={{
            top: headerHeight,
            /* La altura será el 100% de la pantalla menos el header */
            height: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
            <ProductFilterControls categories={categories} brands={brands} />
          </div>
        </aside>

        {/* COLUMNA DERECHA: Contenido que hace scroll */}
        <section className="flex-1 flex flex-col min-w-0 gap-2">
          {/* Zona de Banners */}
          {hasBanners && (
            <div className="w-full">
              <HeroSection
                banners={banners.map((b) => ({
                  ...b,
                  image_url: getCatalogImageUrl(b.image_url),
                }))}
              />
            </div>
          )}

          {/* Zona de Productos */}
          <section
            id="catalog-products"
            className="w-full flex flex-col min-w-0"
          >
            {/* Loader — barra fina */}
            <div
              className={`h-0.5 w-full overflow-hidden rounded-full transition-opacity duration-200 ${
                isFetching && !isLoading
                  ? "opacity-100 mb-3"
                  : "opacity-0 mb-0 h-0"
              } bg-border`}
            >
              <div className="h-full w-2/5 bg-primary/60 rounded-full catalog-loading-bar" />
            </div>

            {/* Categorías — solo mobile/tablet */}
            <div className="w-full flex flex-col gap-2 mb-3 lg:hidden">
              <h2 className="px-1 text-base font-inter font-semibold text-catalog-secondary/70">
                Categorías
              </h2>
              <CategoryPills categories={categories} />
            </div>

            {/* Header de resultados */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-inter font-semibold text-catalog-secondary/70 lg:text-lg">
                Catálogo
              </h2>
              <span className="text-sm font-inter font-semibold text-catalog-secondary/50 lg:text-sm">
                {total} {total === 1 ? "producto" : "productos"}
              </span>
            </div>

            {/* Grid de Productos */}
            <div
              className={`transition-opacity duration-200 ${
                isFetching && !isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <ProductGrid
                products={products}
                isLoading={isLoading}
                hasBanners={hasBanners}
                whatssapNumber={store.whatsapp_number}
              />
            </div>

            {/* Paginación */}
            {totalPages > 0 && (
              <ProductPagination
                totalPages={totalPages}
                pageSize={12}
                total={total}
              />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
