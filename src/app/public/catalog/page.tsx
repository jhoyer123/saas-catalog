"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";
import { mockProducts } from "@/constants/products.mock";

export default function Catalog() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const previousFiltersRef = useRef<string>("");

  const {
    filters,
    updateFilter,
    resetFilters,
    setPage,
    setPageSize,
    paginatedResult,
    availableBrands,
  } = useProductFilter({ products: mockProducts });

  // Efecto para hacer scroll al inicio cuando cambian los filtros o la página
  useEffect(() => {
    const currentFiltersString = JSON.stringify({
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      isOffer: filters.isOffer,
      brand: filters.brand,
      sortBy: filters.sortBy,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    // Solo hacer scroll si los filtros realmente cambiaron (no en el primer render)
    if (
      previousFiltersRef.current &&
      currentFiltersString !== previousFiltersRef.current
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    previousFiltersRef.current = currentFiltersString;
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.isOffer,
    filters.brand,
    filters.sortBy,
    filters.page,
    filters.pageSize,
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con búsqueda y botón de filtros móvil */}
      <Header
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        onOpenFilters={() => setMobileFiltersOpen(true)}
      />

      {/* Sheet de filtros para móvil */}
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        availableBrands={availableBrands}
      />

      {/* Hero Section + Filtros Desktop */}
      <div className="max-w-7xl w-full mx-auto py-6">
        <div className="flex flex-col items-center justify-center lg:flex-row gap-3 px-2">
          {/* Panel de filtros - Desktop Only */}
          <aside className="hidden lg:block md:w-64 lg:w-72 xl:w-100 shrink-0">
            <div className="sticky top-4">
              <ProductFilterControls
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                availableBrands={availableBrands}
              />
            </div>
          </aside>

          {/* Hero Section */}
          <div className="w-full lg:w-2/3">
            <HeroSection />
          </div>
        </div>
      </div>

      {/* Sección de productos */}
      <section className="container w-full max-w-7xl mx-auto px-4">
        {/* Header de resultados */}
        <div className="mb-6 flex flex-col items-start gap-2 md:flex-row md:items-center lg:justify-between w-full">
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {paginatedResult.total} productos encontrados
          </p>
        </div>

        {/* Grid de productos */}
        <ProductGrid products={paginatedResult.items} isLoading={false} />

        {/* Paginación */}
        {paginatedResult.totalPages > 0 && (
          <ProductPagination
            currentPage={paginatedResult.currentPage}
            totalPages={paginatedResult.totalPages}
            pageSize={paginatedResult.pageSize}
            total={paginatedResult.total}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        )}
      </section>
    </main>
  );
}
