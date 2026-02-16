# Guía de Migración a SSR

Este documento explica cómo migrar el sistema de filtrado de productos de cliente (CSR) a servidor (SSR) con Supabase.

## Estado Actual (CSR - Client Side Rendering)

Actualmente, la funcionalidad de filtrado funciona completamente en el cliente:

- Los datos se obtienen de `mockProducts` 
- El hook `useProductFilter` maneja todo el filtrado y paginación en el cliente
- Todos los productos se cargan inicialmente

## Migración a SSR (Server Side Rendering)

### Paso 1: Convertir la página a Server Component

```tsx
// src/app/public/catalog/page.tsx

import { Suspense } from "react";
import Header from "@/components/catalog/header/Header";
import HeroSection from "@/components/catalog/offer/HeroSection";
import { ProductCatalogContent } from "./ProductCatalogContent";
import { getProducts } from "@/lib/services/products";

interface PageProps {
  searchParams: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    isOffer?: string;
    brand?: string;
    sortBy?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function Catalog({ searchParams }: PageProps) {
  // Parsear los parámetros
  const filters = {
    search: searchParams.search || "",
    category: searchParams.category || null,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : null,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null,
    isOffer: searchParams.isOffer === "true" ? true : null,
    brand: searchParams.brand || null,
    sortBy: searchParams.sortBy || null,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 12,
  };

  // Obtener productos desde Supabase
  const { products, total } = await getProducts(filters);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      
      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductCatalogContent 
          products={products}
          total={total}
          initialFilters={filters}
        />
      </Suspense>
    </main>
  );
}
```

### Paso 2: Crear el servicio de Supabase

```tsx
// src/lib/services/products.ts

import { supabaseClient } from "@/lib/supabase/supabaseClient";
import { ProductCatalog } from "@/types/product.types";

export interface ProductFilters {
  search?: string;
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isOffer?: boolean | null;
  brand?: string | null;
  sortBy?: "name" | "price-asc" | "price-desc" | "newest" | null;
  page: number;
  pageSize: number;
}

export async function getProducts(filters: ProductFilters) {
  let query = supabaseClient
    .from("products")
    .select("*", { count: "exact" });

  // Aplicar filtros
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
    );
  }

  if (filters.category) {
    query = query.eq("category_id", filters.category);
  }

  if (filters.minPrice !== null) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== null) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.isOffer) {
    query = query.eq("is_offer", true);
  }

  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  // Ordenamiento
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
    }
  }

  // Paginación
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0 };
  }

  return {
    products: data as ProductCatalog[],
    total: count || 0,
  };
}
```

### Paso 3: Crear componente cliente para interactividad

```tsx
// src/app/public/catalog/ProductCatalogContent.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/catalog/products/ProductGrid";
import { ProductFilterControls } from "@/components/catalog/filter/ProductFilterControls";
import { ProductPagination } from "@/components/catalog/products/ProductPagination";
import { ProductCatalog } from "@/types/product.types";

interface ProductCatalogContentProps {
  products: ProductCatalog[];
  total: number;
  initialFilters: any;
}

export function ProductCatalogContent({
  products,
  total,
  initialFilters,
}: ProductCatalogContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: any) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === null || value === "" || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    
    // Reset page cuando cambian filtros
    if (key !== "page" && key !== "pageSize") {
      params.set("page", "1");
    }
    
    router.push(`/public/catalog?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / initialFilters.pageSize);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-4">
            <ProductFilterControls
              filters={initialFilters}
              updateFilter={updateFilter}
              resetFilters={() => router.push("/public/catalog")}
              availableBrands={[]} // Obtener de Supabase
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Catálogo de Productos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {total} productos encontrados
            </p>
          </div>

          <ProductGrid products={products} />

          {totalPages > 0 && (
            <ProductPagination
              currentPage={initialFilters.page}
              totalPages={totalPages}
              pageSize={initialFilters.pageSize}
              total={total}
              setPage={(page) => updateFilter("page", page)}
              setPageSize={(pageSize) => updateFilter("pageSize", pageSize)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
```

## Ventajas de SSR

1. **SEO mejorado**: Los motores de búsqueda pueden rastrear el contenido
2. **Performance inicial**: Los usuarios ven contenido más rápido
3. **Escalabilidad**: No se cargan todos los productos al inicio
4. **URLs compartibles**: Los filtros están en la URL

## Checklist de Migración

- [ ] Crear tabla de productos en Supabase
- [ ] Implementar servicio `getProducts` con Supabase
- [ ] Convertir página a Server Component
- [ ] Crear componente cliente para interactividad
- [ ] Actualizar filtros para usar `useRouter` y `useSearchParams`
- [ ] Implementar loading states con Suspense
- [ ] Añadir manejo de errores
- [ ] Caché y revalidación con Next.js
- [ ] Testing de filtros y paginación
