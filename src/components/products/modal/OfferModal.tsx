"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import type { ProductCatalog } from "@/types/product.types";
import { FormOffer } from "../form/FormOffer";

interface OfferModalProps {
  open: boolean;
  product: ProductCatalog;
  onClose: () => void;
}

function isExpired(offer_end: string | null | undefined): boolean {
  if (!offer_end) return false;
  return new Date(offer_end) < new Date();
}

export function OfferModal({ open, product, onClose }: OfferModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Tag className="h-4 w-4" />
            </div>
            <DialogTitle>Gestionar oferta</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{product.name}</strong> · precio original{" "}
            <strong>${product.price.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* El form maneja todo: toggle, campos, estados, validaciones */}
        <FormOffer product={product} onClose={onClose} />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-offer" type="submit">
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
