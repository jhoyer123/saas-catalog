"use client";

import { useEffect, useState } from "react";
import {
  useProductFilter,
  ProductFilters,
} from "@/hooks/catalog/useProductFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { BrandCatalog } from "@/types/brand.types";

interface ProductFilterControlsProps {
  categories: { id: string; name: string }[];
  brands: BrandCatalog[];
}

export function ProductFilterControls({
  categories,
  brands,
}: ProductFilterControlsProps) {
  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    searchInput,
    setSearchInput,
    priceMinInput,
    setPriceMinInput,
    priceMaxInput,
    setPriceMaxInput,
  } = useProductFilter();

  const [onlyOffersChecked, setOnlyOffersChecked] = useState(
    filters.isOffer === true,
  );

  useEffect(() => {
    setOnlyOffersChecked(filters.isOffer === true);
  }, [filters.isOffer]);

  return (
    <div className="bg-card rounded-2xl lg:border lg:border-border/50 p-4 lg:p-7 space-y-5 lg:shadow-sm">
      {/* Header */}
      <div className="items-center justify-between flex pb-1 border-b border-border/40">
        <h2 className="font-poppins text-sm lg:text-base hidden lg:flex tracking-widest uppercase text-muted-foreground/70 font-medium">
          Filtros
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs h-7 px-3 rounded-full border border-border/60 hover:bg-muted/60 transition-all duration-200 font-medium"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="space-y-2 hidden md:block">
        <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-3.5 w-3.5" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-9 h-9 text-sm bg-muted/30 border-border/40 rounded-xl placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Separador decorativo */}
      <div className="hidden lg:block h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />

      {/* Categoría */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
          Categoría
        </Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            updateFilter("category", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/40 rounded-xl focus:ring-1 focus:ring-offset-0 transition-all">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="max-h-60 overflow-y-auto rounded-xl border-border/50 shadow-lg"
          >
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marca */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
            Marca
          </Label>
          <Select
            value={filters.brand || "all"}
            onValueChange={(value) =>
              updateFilter("brand", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/40 rounded-xl focus:ring-1 focus:ring-offset-0 transition-all">
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="max-h-60 overflow-y-auto rounded-xl border-border/50 shadow-lg"
            >
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="hidden lg:block h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />

      {/* Rango de precio */}
      {/* <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
          Precio
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Mín"
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            min="0"
            step="10"
            className="h-9 text-sm bg-muted/30 border-border/40 rounded-xl placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all"
          />
          <Input
            type="number"
            placeholder="Máx"
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            min="0"
            step="10"
            className="h-9 text-sm bg-muted/30 border-border/40 rounded-xl placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all"
          />
        </div>
      </div> */}

      {/* Solo ofertas */}
      <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-muted/30 border border-border/30 hover:border-border/60 transition-all cursor-pointer group">
        <Label
          htmlFor="onlyOffers"
          className="text-sm font-medium cursor-pointer group-hover:text-foreground transition-colors"
        >
          Solo ofertas
        </Label>
        <input
          type="checkbox"
          id="onlyOffers"
          checked={onlyOffersChecked}
          onChange={(e) => {
            const checked = e.target.checked;
            setOnlyOffersChecked(checked);
            updateFilter("isOffer", checked ? true : null);
          }}
          className="w-4 h-4 rounded accent-foreground cursor-pointer"
        />
      </div>

      <div className="hidden lg:block h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />

      {/* Ordenar por */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60">
          Ordenar
        </Label>
        <Select
          value={filters.sortBy || "none"}
          onValueChange={(value) =>
            updateFilter(
              "sortBy",
              value === "none" ? null : (value as ProductFilters["sortBy"]),
            )
          }
        >
          <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/40 rounded-xl focus:ring-1 focus:ring-offset-0 transition-all">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="max-h-60 overflow-y-auto rounded-xl border-border/50 shadow-lg"
          >
            <SelectItem value="none">Sin orden</SelectItem>
            <SelectItem value="price_asc">Precio (menor a mayor)</SelectItem>
            <SelectItem value="price_desc">Precio (mayor a menor)</SelectItem>
            <SelectItem value="newest">Más recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
