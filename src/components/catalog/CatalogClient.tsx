"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
//import { getPublicProducts } from "@/lib/actions/catalogActions";
import { fetchPublicProducts } from "@/lib/services/catalogServiceProduct";
import type { ProductCatalogCard } from "@/types/product.types";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { Banner } from "@/types/catalog/catalog.types";
import { InputSearch } from "./header/InputSearch";
//import { checkIsOfferActive } from "@/lib/helpers/validations";

interface CatalogClientProps {
  initialProductData: {
    products: ProductCatalogCard[];
    totalPages: number;
    total: number;
  };
  categories: { id: string; name: string }[];
  brands: string[];
  banners: Banner[];
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number: string | null;
  };
}

export default function CatalogClient({
  initialProductData,
  categories,
  brands,
  banners,
  store,
}: CatalogClientProps) {
  // estates for mobile filter sheet and header height (for scroll offset)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Effect para medir altura del header (filtro sticky) y actualizarla dinámicamente
  useEffect(() => {
    const header = document.getElementById("catalog-header");
    if (!header) return;
    const ro = new ResizeObserver(() => setHeaderHeight(header.offsetHeight));
    ro.observe(header);
    setHeaderHeight(header.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // Lee los filtros actuales desde la URL para pasarlos a la query de productos
  const searchParams = useSearchParams();
  // Extraer cada filtro de los search params, con fallback a string vacío
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const onlyOffers = searchParams.get("onlyOffers") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const pageNum = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "public-products",
      store.slug,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      onlyOffers,
      sort,
      pageNum,
    ],
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
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnMount: "always",
  });
  const products = data?.products ?? initialProductData.products;
  const totalPages = data?.totalPages ?? initialProductData.totalPages;
  const total = data?.total ?? initialProductData.total;
  const hasBanners = banners && banners.length > 0;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Header store={store} />
      <div style={{ height: headerHeight }} />
      <div
        className="bg-card py-2 sticky z-20 top-0 h-full w-full flex items-center justify-center lg:hidden"
        style={{ top: headerHeight }}
      >
        <InputSearch onOpenFilters={() => setMobileFiltersOpen(true)} />
      </div>
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
              <HeroSection banners={banners} />
            </div>
          </div>
        </div>
      )}

      <section
        id="catalog-products"
        className="container w-full h-full max-w-7xl mx-auto px-1"
      >
        <div
          className={`flex h-full  ${hasBanners ? "py-0 gap-6" : "py-6 gap-3"}`}
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
            <div className="mb-6 flex flex-col items-start md:flex-row md:items-center md:justify-between w-full px-4">
              <h1 className="text-xl font-bold font-poppins text-gray-900 md:text-2xl">
                Catálogo de Productos
              </h1>
              <p className="text-sm font-inter text-gray-600">
                {total} productos encontrados
              </p>
            </div>

            {/* Barra de progreso sutil mientras se actualiza con filtros activos */}
            {isFetching && !isLoading && (
              <div className="h-0.5 w-full overflow-hidden mb-2 bg-border rounded-full">
                <div className="h-full w-2/5 bg-primary/50 rounded-full catalog-loading-bar" />
              </div>
            )}
            <div
              className="transition-opacity duration-200"
              style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
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
