"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilterControls } from "./ProductFilterControls";
import { ProductFilters } from "@/hooks/catalog/useProductFilter";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFilters;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => void;
  resetFilters: () => void;
  availableBrands: string[];
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  filters,
  updateFilter,
  resetFilters,
  availableBrands,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-75 sm:w-100 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Personaliza tu búsqueda de productos
          </SheetDescription>
        </SheetHeader>
        <div className="px-2">
          <ProductFilterControls
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            availableBrands={availableBrands}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
