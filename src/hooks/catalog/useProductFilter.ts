"use client";

import { useState, useMemo } from "react";
import { ProductCatalog } from "@/types/product.types";

export interface ProductFilters {
  search: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  isOffer: boolean | null;
  brand: string | null;
  sortBy: "name" | "price-asc" | "price-desc" | "newest" | null;
  page: number;
  pageSize: number;
}

interface UseProductFilterProps {
  products: ProductCatalog[];
}

interface PaginatedResult {
  items: ProductCatalog[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function useProductFilter({ products }: UseProductFilterProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: null,
    minPrice: null,
    maxPrice: null,
    isOffer: null,
    brand: null,
    sortBy: null,
    page: 1,
    pageSize: 12,
  });

  // Filtrado y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filtrar solo productos disponibles (opcional, puedes comentar esta línea)
    // result = result.filter(p => p.is_available);

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.name_category.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría
    if (filters.category) {
      result = result.filter((p) => p.category_id === filters.category);
    }

    // Filtro por rango de precio
    if (filters.minPrice !== null) {
      result = result.filter((p) => {
        const price = p.is_offer && p.offer_price ? p.offer_price : p.price;
        return price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice !== null) {
      result = result.filter((p) => {
        const price = p.is_offer && p.offer_price ? p.offer_price : p.price;
        return price <= filters.maxPrice!;
      });
    }

    // Filtro por ofertas
    if (filters.isOffer !== null) {
      result = result.filter((p) => p.is_offer === filters.isOffer);
    }

    // Filtro por marca
    if (filters.brand) {
      result = result.filter((p) => p.brand === filters.brand);
    }

    // Ordenamiento
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "price-asc":
          result.sort((a, b) => {
            const priceA = a.is_offer && a.offer_price ? a.offer_price : a.price;
            const priceB = b.is_offer && b.offer_price ? b.offer_price : b.price;
            return priceA - priceB;
          });
          break;
        case "price-desc":
          result.sort((a, b) => {
            const priceA = a.is_offer && a.offer_price ? a.offer_price : a.price;
            const priceB = b.is_offer && b.offer_price ? b.offer_price : b.price;
            return priceB - priceA;
          });
          break;
        case "newest":
          result.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
      }
    }

    return result;
  }, [products, filters]);

  // Paginación
  const paginatedResult = useMemo((): PaginatedResult => {
    const total = filteredAndSortedProducts.length;
    const totalPages = Math.ceil(total / filters.pageSize);
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;
    const items = filteredAndSortedProducts.slice(start, end);

    return {
      items,
      total,
      totalPages,
      currentPage: filters.page,
      pageSize: filters.pageSize,
    };
  }, [filteredAndSortedProducts, filters.page, filters.pageSize]);

  // Helpers para actualizar filtros
  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value,
      };
      
      // Reset page cuando cambian los filtros (excepto cuando se cambia la página o pageSize)
      if (key !== "page" && key !== "pageSize") {
        newFilters.page = 1;
      }
      
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: null,
      minPrice: null,
      maxPrice: null,
      isOffer: null,
      brand: null,
      sortBy: null,
      page: 1,
      pageSize: 12,
    });
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const setPageSize = (pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize,
      page: 1, // Reset to first page when changing page size
    }));
  };

  // Obtener marcas únicas para el filtro
  const availableBrands = useMemo(() => {
    const brands = products
      .map((p) => p.brand)
      .filter((brand): brand is string => brand !== null);
    return Array.from(new Set(brands)).sort();
  }, [products]);

  return {
    filters,
    updateFilter,
    resetFilters,
    setPage,
    setPageSize,
    paginatedResult,
    availableBrands,
  };
}
