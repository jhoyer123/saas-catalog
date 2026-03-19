"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductCatalog } from "@/types/product.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, TagIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ModalType } from "@/hooks/products/useModalsProduct";
import { checkIsOfferActive } from "@/lib/helpers/validations";

// ============================================
// HELPERS
// ============================================

/**
 * Formatea un número como precio con 2 decimales.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(price);

// ============================================
// PROPS
// ============================================

interface ColumnsProps {
  onOpenModal: (type: ModalType, product: ProductCatalog) => void;
}

// ============================================
// COLUMNAS
// ============================================

export const createProductsColumns = ({
  onOpenModal,
}: ColumnsProps): ColumnDef<ProductCatalog>[] => [
  // ── Imagen ──────────────────────────────────
  {
    accessorKey: "images",
    enableSorting: false,
    header: "Producto",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const name = row.getValue("name") as string;

      if (images?.length > 0) {
        return (
          <div className="relative h-11 w-11 overflow-hidden rounded-md border bg-muted shrink-0">
            <Image
              src={images[0]}
              alt={name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        );
      }

      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-md border bg-muted shrink-0">
          <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
            Sin imagen
          </span>
        </div>
      );
    },
  },

  // ── Nombre + Marca ───────────────────────────
  {
    accessorKey: "name",
    enableSorting: true,
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const brand = row.original.brand;

      return (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {brand ?? "Sin marca"}
          </span>
        </div>
      );
    },
  },

  // ── SKU ─────────────────────────────────────
  {
    accessorKey: "sku",
    enableSorting: true,
    header: "Cod. Unico",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("sku") ?? "Sin código"}
      </span>
    ),
  },

  // ── Categoría ───────────────────────────────
  {
    accessorKey: "name_category",
    enableSorting: false,
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.getValue("name_category") as string;
      return (
        <Badge variant="secondary" className="font-normal">
          {category ?? "Sin categoría"}
        </Badge>
      );
    },
  },

  // ── Precio ──────────────────────────────────
  {
    accessorKey: "price",
    enableSorting: true,
    header: "Precio",
    cell: ({ row }) => {
      const isOffer = checkIsOfferActive({
        is_offer: row.original.is_offer,
        offer_price: row.original.offer_price,
        offer_start: row.original.offer_start || null,
        offer_end: row.original.offer_end || null,
      });

      if (isOffer) {
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-green-600">
              {formatPrice(row.original.offer_price!)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(row.original.price)}
            </span>
          </div>
        );
      }

      return (
        <span className="text-sm font-medium">
          {formatPrice(row.original.price)}
        </span>
      );
    },
  },

  // ── Oferta ──────────────────────────────────
  {
    accessorKey: "isOfferActive",
    enableSorting: false,
    header: "Oferta",
    cell: ({ row }) => {
      const isOffer = checkIsOfferActive({
        is_offer: row.original.is_offer,
        offer_price: row.original.offer_price,
        offer_start: row.original.offer_start || null,
        offer_end: row.original.offer_end || null,
      });

      return isOffer ? (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 font-normal">
          En oferta
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground font-normal">
          Normal
        </Badge>
      );
    },
  },

  // ── Acciones ────────────────────────────────
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const product = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Ver detalles */}
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/products/${product.id}/view`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>

            {/* Editar */}
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/products/${product.id}/edit`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>

            {/* Oferta */}
            <DropdownMenuItem onClick={() => onOpenModal("offer", product)}>
              <TagIcon className="mr-2 h-4 w-4 text-amber-500" />
              Gestionar oferta
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Eliminar */}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onOpenModal("delete", product)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
