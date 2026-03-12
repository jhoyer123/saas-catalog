"use client";

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

interface ProductFilterControlsProps {
  categories: { id: string; name: string }[];
  brands: string[];
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

  return (
    <div className="bg-card rounded-lg lg:border lg:border-border p-3 space-y-3 lg:p-6">
      <div className="items-center justify-between flex">
        <h2 className="font-poppins text-base lg:text-xl hidden lg:flex">
          Filtros
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-sm bg-gray-50"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="space-y-2 hidden md:block">
        <Label className="text-sm font-medium text-gray-700">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Categoría</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            updateFilter("category", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent position="popper">
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
          <Label className="text-sm font-medium text-gray-700">Marca</Label>
          <Select
            value={filters.brand || "all"}
            onValueChange={(value) =>
              updateFilter("brand", value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Rango de precio */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Rango de precio
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Mín"
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            min="0"
            step="10"
          />
          <Input
            type="number"
            placeholder="Máx"
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            min="0"
            step="10"
          />
        </div>
      </div>

      {/* Solo ofertas */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="onlyOffers"
          checked={filters.isOffer === true}
          onChange={(e) =>
            updateFilter("isOffer", e.target.checked ? true : null)
          }
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <Label
          htmlFor="onlyOffers"
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          Solo ofertas
        </Label>
      </div>

      {/* Ordenar por */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Ordenar por</Label>
        <Select
          value={filters.sortBy || "none"}
          onValueChange={(value) =>
            updateFilter(
              "sortBy",
              value === "none" ? null : (value as ProductFilters["sortBy"]),
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="none">Sin orden</SelectItem>
            <SelectItem value="price_asc">Precio (menor a mayor)</SelectItem>
            <SelectItem value="price_desc">Precio (mayor a menor)</SelectItem>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="display_order">Orden de tienda</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
