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
      <SheetContent
        side="left"
        className="w-66 sm:w-100 overflow-y-auto duration-0 transition-none"
      >
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Personaliza tu búsqueda de productos
          </SheetDescription>
        </SheetHeader>
        <div className="px-1">
          {open ? (
            <ProductFilterControls categories={categories} brands={brands} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
