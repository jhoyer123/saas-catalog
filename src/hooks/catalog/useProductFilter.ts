"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/catalog/useDebounce";
import { useEffect, useRef, useState, useTransition } from "react";

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

  const [isPending, startTransition] = useTransition();

  // ── Scroll post-navegación ────────────────────────────────────────────────
  // La ref marca si debe scrollear. El effect se dispara cuando
  // searchParams.toString() cambia (= después del re-render con nuevos params).
  const pendingScrollRef = useRef(false);
  const isFirstRender = useRef(true);
  const paramsString = searchParams.toString();

  useEffect(() => {
    // Ignorar el primer render (carga inicial)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;

    // Pequeño delay para dar chance al browser de completar layout/paint
    const timer = setTimeout(() => {
      // En pantallas lg+ los filtros están al lado, no hace falta scrollear
      if (window.innerWidth >= 1024) return;

      const section = document.getElementById("catalog-products");
      if (!section) return;
      const header = document.getElementById("catalog-header");
      const headerHeight = header ? header.offsetHeight : 0;
      const top =
        section.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [paramsString]);

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

  /**
   * Actualiza un param en la URL.
   * - Usa router.replace (no ensucia el historial del navegador).
   * - Wrappea en startTransition para que React no bloquee el render.
   * - scroll: true solo para filtros discretos (categoria, marca, etc.)
   *   Los inputs con debounce pasan scroll=false para no hacer scroll en cada tecla.
   */
  const updateParam = (key: string, value: string | null, scroll = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page" && key !== "pageSize") {
      params.delete("page");
    }
    if (scroll) pendingScrollRef.current = true;
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
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

  // ── Debounce para search (300ms) ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentSearch) {
      updateParam("search", debouncedSearch || null, true);
    }
  }, [debouncedSearch]);

  // ── Debounce para precios (500ms) ─────────────────────────────────────────
  // Sin esto, cada tecla en el input dispara router.replace + Supabase query.
  const [priceMinInput, setPriceMinInput] = useState(
    searchParams.get("minPrice") ?? "",
  );
  const [priceMaxInput, setPriceMaxInput] = useState(
    searchParams.get("maxPrice") ?? "",
  );
  const debouncedMinPrice = useDebounce(priceMinInput, 500);
  const debouncedMaxPrice = useDebounce(priceMaxInput, 500);

  useEffect(() => {
    const current = searchParams.get("minPrice") ?? "";
    if (debouncedMinPrice !== current) {
      updateParam("minPrice", debouncedMinPrice || null, true);
    }
  }, [debouncedMinPrice]);

  useEffect(() => {
    const current = searchParams.get("maxPrice") ?? "";
    if (debouncedMaxPrice !== current) {
      updateParam("maxPrice", debouncedMaxPrice || null, true);
    }
  }, [debouncedMaxPrice]);

  const updateFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => {
    // minPrice y maxPrice los maneja el state local + debounce exclusivamente
    if (key === "minPrice" || key === "maxPrice") return;

    const urlKey = keyMap[key];

    if (value === null || value === "" || value === false) {
      updateParam(urlKey, null, true);
      return;
    }

    updateParam(urlKey, String(value), true);
  };

  const resetFilters = () => {
    setSearchInput("");
    setPriceMinInput("");
    setPriceMaxInput("");
    pendingScrollRef.current = true;
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const setPage = (page: number) => {
    updateParam("page", String(page), true);
  };

  const setPageSize = (pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(pageSize));
    params.delete("page");
    pendingScrollRef.current = true;
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
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
