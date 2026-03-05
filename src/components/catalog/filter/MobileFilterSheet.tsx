"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilterControls } from "./ProductFilterControls";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  brands: string[];
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  categories,
  brands,
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
          <ProductFilterControls categories={categories} brands={brands} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
