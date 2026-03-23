"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types/category.types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
//import Image from "next/image";

import type { CategoryModalMode } from "@/hooks/category/useModalsCategory";

// La única dependencia externa que necesitan las columnas:
// un callback para abrir el modal con el modo y la categoría correspondiente
interface ColumnOptions {
  onOpenModal: (mode: CategoryModalMode, category: Category) => void;
}

// Factory function igual a createProductsColumns:
// recibe opciones y devuelve las columnas ya configuradas
export const getCategoriesColumns = ({
  onOpenModal,
}: ColumnOptions): ColumnDef<Category>[] => [
  /* {
    accessorKey: "image_url",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string | null
      const categoryName = row.getValue("name") as string
      
      return imageUrl ? (
        <div className="h-12 w-12 overflow-hidden rounded-md border">
          <Image
            src={imageUrl}
            alt={categoryName}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
          <span className="text-xs text-muted-foreground">Sin imagen</span>
        </div>
      )
    },
  }, */
  {
    accessorKey: "name",
    enableSorting: true,
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    enableSorting: true,
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;

      return (
        <span className="max-w-md truncate text-sm text-muted-foreground">
          {description || "Sin descripción"}
        </span>
      );
    },
  },
  {
    accessorKey: "product_count",
    enableSorting: false,
    header: "Cant. Productos",
    cell: ({ row }) => {
      const count = row.getValue("product_count") as number;
      return <span className="text-sm">{count}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de creación",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string);

      return (
        <span className="text-sm">
          {date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Cada item abre el modal en el modo correcto */}
            <DropdownMenuItem onClick={() => onOpenModal("view", category)}>
              <Eye className="mr-2 h-4 w-4" />
              Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenModal("edit", category)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onOpenModal("delete", category)}
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
