// src/hooks/catalog/useProductFilter.ts
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/catalog/useDebounce";
import { useEffect, useState } from "react";

export interface ProductFilters {
  search: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  isOffer: boolean | null;
  brand: string | null;
  sortBy: "price_asc" | "price_desc" | "newest" | "display_order" | null;
  page: number;
  pageSize: number;
}

export function useProductFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lee los filtros actuales desde la URL
  const filters: ProductFilters = {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category"),
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : null,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : null,
    isOffer: searchParams.get("onlyOffers") === "true" ? true : null,
    brand: searchParams.get("brand"),
    sortBy: (searchParams.get("sort") as ProductFilters["sortBy"]) ?? null,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 12,
  };

  const scrollToProducts = () => {
    const section = document.getElementById("catalog-products");
    if (section) {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Función base para actualizar un param en la URL
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page al cambiar cualquier filtro excepto page y pageSize
    if (key !== "page" && key !== "pageSize") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    scrollToProducts();
  };

  // Mapeo de keys del filtro a keys de la URL
  const keyMap: Record<keyof ProductFilters, string> = {
    search: "search",
    category: "category",
    minPrice: "minPrice",
    maxPrice: "maxPrice",
    isOffer: "onlyOffers",
    brand: "brand",
    sortBy: "sort",
    page: "page",
    pageSize: "pageSize",
  };

  // Debounce solo para search
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentSearch) {
      updateParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch]);

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => {
    const urlKey = keyMap[key];

    if (value === null || value === "" || value === false) {
      updateParam(urlKey, null);
      return;
    }

    updateParam(urlKey, String(value));
  };

  const resetFilters = () => {
    router.push(pathname, { scroll: false });
    scrollToProducts();
  };

  const setPage = (page: number) => {
    updateParam("page", String(page));
  };

  const setPageSize = (pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(pageSize));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    scrollToProducts();
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.category ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.isOffer !== null ||
    filters.brand ||
    filters.sortBy
  );

  return {
    filters,
    searchInput,
    setSearchInput,
    updateFilter,
    resetFilters,
    setPage,
    setPageSize,
    hasActiveFilters,
  };
}
