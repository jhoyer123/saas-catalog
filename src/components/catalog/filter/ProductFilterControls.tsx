"use client";

import { ProductFilters } from "@/hooks/catalog/useProductFilter";
import { mockCategories } from "@/constants/categories.mock";
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

interface ProductFilterControlsProps {
  filters: ProductFilters;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => void;
  resetFilters: () => void;
  availableBrands: string[];
}

export function ProductFilterControls({
  filters,
  updateFilter,
  resetFilters,
  availableBrands,
}: ProductFilterControlsProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.isOffer !== null ||
    filters.brand ||
    filters.sortBy;

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 space-y-3
    lg:p-6"
    >
      <div className="items-center justify-between hidden
      lg:flex">
        <h2>Filtros</h2>

        {/* Botón para limpiar filtros */}
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
      <div
        className="space-y-2 hidden
       md:block"
      >
        <Label className="text-sm font-medium text-gray-700">Buscar</Label>
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
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
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {mockCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Marca */}
      {availableBrands.length > 0 && (
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
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {availableBrands.map((brand) => (
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
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              updateFilter(
                "minPrice",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            min="0"
            step="10"
          />
          <Input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              updateFilter(
                "maxPrice",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
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
          <SelectContent>
            <SelectItem value="none">Sin orden</SelectItem>
            <SelectItem value="name">Nombre (A-Z)</SelectItem>
            <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
            <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
            <SelectItem value="newest">Más recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
