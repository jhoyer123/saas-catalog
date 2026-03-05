"use client";

import { useState } from "react";
import { ProductCatalogCard } from "@/types/product.types";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { MobileFilterSheet } from "@/components/catalog/filter/MobileFilterSheet";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { Banner } from "@/types/catalog/catalog.types";

interface CatalogClientProps {
  products: ProductCatalogCard[];
  totalPages: number;
  total: number;
  categories: { id: string; name: string }[];
  brands: string[];
  banners: Banner[];
}

export default function CatalogClient({
  products,
  totalPages,
  total,
  categories,
  brands,
  banners,
}: CatalogClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Header onOpenFilters={() => setMobileFiltersOpen(true)} />

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

        <ProductGrid products={products} isLoading={false} />

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
