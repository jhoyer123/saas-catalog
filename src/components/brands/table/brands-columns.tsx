"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandDashboard } from "@/types/brand.types";
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

import type { BrandModalMode } from "@/hooks/brand/useModalsBrand";

interface ColumnOptions {
  onOpenModal: (mode: BrandModalMode, brand: BrandDashboard | null) => void;
}

export const getBrandsColumns = ({ onOpenModal }: ColumnOptions): ColumnDef<BrandDashboard>[] => [
  {
    accessorKey: "name",
    enableSorting: true,
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <span className="font-medium">{name}</span>;
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
      const brand = row.original;

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

            <DropdownMenuItem onClick={() => onOpenModal("view", brand)}>
              <Eye className="mr-2 h-4 w-4" />
              Detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenModal("edit", brand)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onOpenModal("delete", brand)}
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
