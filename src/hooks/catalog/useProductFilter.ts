"use client";

import { create } from "zustand";
import { useDebounce } from "@/hooks/catalog/useDebounce";
import { useEffect } from "react";

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

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: null,
  minPrice: null,
  maxPrice: null,
  isOffer: null,
  brand: null,
  sortBy: null,
  page: 1,
  pageSize: 12,
};

type ProductFilterStore = {
  filters: ProductFilters;
  searchInput: string;
  priceMinInput: string;
  priceMaxInput: string;
  initialized: boolean;
  isPending: boolean;
  initializeFromUrl: () => void;
  setSearchInput: (value: string) => void;
  setPriceMinInput: (value: string) => void;
  setPriceMaxInput: (value: string) => void;
  setPending: (pending: boolean) => void;
  setSearchFilter: (value: string) => void;
  setMinPriceFilter: (value: string) => void;
  setMaxPriceFilter: (value: string) => void;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

function syncUrl(filters: ProductFilters) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.isOffer === true) params.set("onlyOffers", "true");
  if (filters.sortBy) params.set("sort", filters.sortBy);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== 12) params.set("pageSize", String(filters.pageSize));

  const query = params.toString();
  const target = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", target);
}

const useProductFilterStore = create<ProductFilterStore>((set, get) => ({
  filters: DEFAULT_FILTERS,
  searchInput: "",
  priceMinInput: "",
  priceMaxInput: "",
  initialized: false,
  isPending: false,

  initializeFromUrl: () => {
    if (get().initialized || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const nextFilters: ProductFilters = {
      search: params.get("search") ?? "",
      category: params.get("category"),
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : null,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : null,
      isOffer: params.get("onlyOffers") === "true" ? true : null,
      brand: params.get("brand"),
      sortBy: (params.get("sort") as ProductFilters["sortBy"]) ?? null,
      page: Number(params.get("page")) || 1,
      pageSize: Number(params.get("pageSize")) || 12,
    };

    set({
      filters: nextFilters,
      searchInput: nextFilters.search,
      priceMinInput:
        nextFilters.minPrice !== null ? String(nextFilters.minPrice) : "",
      priceMaxInput:
        nextFilters.maxPrice !== null ? String(nextFilters.maxPrice) : "",
      initialized: true,
    });
  },

  setSearchInput: (value) => set({ searchInput: value }),
  setPriceMinInput: (value) => set({ priceMinInput: value }),
  setPriceMaxInput: (value) => set({ priceMaxInput: value }),
  setPending: (pending) => set({ isPending: pending }),

  setSearchFilter: (value) => {
    const nextFilters = {
      ...get().filters,
      search: value,
      page: 1,
    };
    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  setMinPriceFilter: (value) => {
    const nextFilters = {
      ...get().filters,
      minPrice: value ? Number(value) : null,
      page: 1,
    };
    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  setMaxPriceFilter: (value) => {
    const nextFilters = {
      ...get().filters,
      maxPrice: value ? Number(value) : null,
      page: 1,
    };
    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  updateFilter: (key, value) => {
    if (key === "minPrice" || key === "maxPrice") return;

    const nextFilters = {
      ...get().filters,
      [key]: value,
      page: key === "page" || key === "pageSize" ? get().filters.page : 1,
    } as ProductFilters;

    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  resetFilters: () => {
    const nextFilters = { ...DEFAULT_FILTERS };
    set({
      filters: nextFilters,
      searchInput: "",
      priceMinInput: "",
      priceMaxInput: "",
      isPending: true,
    });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  setPage: (page) => {
    const safePage = Math.max(1, page);
    const nextFilters = { ...get().filters, page: safePage };
    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },

  setPageSize: (pageSize) => {
    const safeSize = Math.max(1, pageSize);
    const nextFilters = { ...get().filters, pageSize: safeSize, page: 1 };
    set({ filters: nextFilters, isPending: true });
    syncUrl(nextFilters);
    set({ isPending: false });
  },
}));

export function useProductFilter() {
  const {
    filters,
    isPending,
    searchInput,
    setSearchInput,
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
    updateFilter,
    resetFilters,
    setPage,
    setPageSize,
    initializeFromUrl,
    setSearchFilter,
    setMinPriceFilter,
    setMaxPriceFilter,
  } = useProductFilterStore();

  useEffect(() => {
    initializeFromUrl();
  }, [initializeFromUrl]);

  // ── Debounce para search (300ms) ──────────────────────────────────────────
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearchFilter(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setSearchFilter]);

  // ── Debounce para precios (500ms) ─────────────────────────────────────────
  // Sin esto, cada tecla en el input dispara router.replace + Supabase query.
  const debouncedMinPrice = useDebounce(priceMinInput, 500);
  const debouncedMaxPrice = useDebounce(priceMaxInput, 500);

  useEffect(() => {
    const current = filters.minPrice !== null ? String(filters.minPrice) : "";
    if (debouncedMinPrice !== current) {
      setMinPriceFilter(debouncedMinPrice);
    }
  }, [debouncedMinPrice, filters.minPrice, setMinPriceFilter]);

  useEffect(() => {
    const current = filters.maxPrice !== null ? String(filters.maxPrice) : "";
    if (debouncedMaxPrice !== current) {
      setMaxPriceFilter(debouncedMaxPrice);
    }
  }, [debouncedMaxPrice, filters.maxPrice, setMaxPriceFilter]);

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
    isPending,
    searchInput,
    setSearchInput,
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
    updateFilter,
    resetFilters,
    setPage,
    setPageSize,
    hasActiveFilters,
  };
}
