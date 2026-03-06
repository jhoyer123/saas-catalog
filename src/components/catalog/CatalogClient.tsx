"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getPublicProducts } from "@/lib/actions/catalogActions";
import type { ProductCatalogCard } from "@/types/product.types";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { Banner } from "@/types/catalog/catalog.types";

interface CatalogClientProps {
  initialProductData: {
    products: ProductCatalogCard[];
    totalPages: number;
    total: number;
  };
  categories: { id: string; name: string }[];
  brands: string[];
  banners: Banner[];
  store: { name: string; slug: string; logo_url: string | null; whatsapp_number: string | null };
}

export default function CatalogClient({
  initialProductData,
  categories,
  brands,
  banners,
  store,
}: CatalogClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const onlyOffers = searchParams.get("onlyOffers") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const pageNum = Number(searchParams.get("page")) || 1;

  const { data, isLoading } = useQuery({
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
      getPublicProducts({
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
    placeholderData: keepPreviousData,
  });

  // Fallback a initialProductData: SSR siempre renderiza productos
  // aunque HydrationBoundary no esté disponible aún en el cliente
  const products = data?.products ?? initialProductData.products;
  const totalPages = data?.totalPages ?? initialProductData.totalPages;
  const total = data?.total ?? initialProductData.total;

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Header store={store} onOpenFilters={() => setMobileFiltersOpen(true)} />

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        categories={categories}
        brands={brands}
      />

      <div className="max-w-7xl w-full mx-auto py-6">
        <div className="flex flex-col items-center justify-center lg:flex-row gap-3 px-2">
          <aside className="hidden lg:block md:w-64 lg:w-72 xl:w-100 shrink-0">
            <div className="sticky top-4">
              <ProductFilterControls categories={categories} brands={brands} />
            </div>
          </aside>
          <div className="w-full lg:w-2/3">
            <HeroSection banners={banners} />
          </div>
        </div>
      </div>

      <section className="container w-full max-w-7xl mx-auto px-1">
        <div className="mb-6 flex flex-col items-start md:flex-row md:items-center lg:justify-between w-full px-4">
          <h1 className="text-xl font-bold font-poppins text-gray-900 md:text-2xl">
            Catálogo de Productos
          </h1>
          <p className="text-sm font-inter text-gray-600">
            {total} productos encontrados
          </p>
        </div>

        <ProductGrid products={products} isLoading={isLoading} />

        {totalPages > 0 && (
          <ProductPagination
            totalPages={totalPages}
            pageSize={12}
            total={total}
          />
        )}
      </section>
    </main>
  );
}
