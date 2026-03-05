# 🛍️ EJEMPLO: Tabla de Productos con DataTableServer

Este ejemplo muestra cómo usar el `DataTableServer` genérico para productos.
Sigue exactamente el mismo patrón que categorías.

## 📝 PASO 1: Server Action para Productos

```typescript
// src/lib/actions/productPaginationActions.ts
"use server"

import { createServerClient } from "@/lib/supabase/supabaseServer"
import { PaginationParams, PaginatedResponse } from "@/types/pagination.types"
import { Product } from "@/types/product.types"

export async function getProductsPaginatedAction(
  params: PaginationParams
): Promise<PaginatedResponse<Product>> {
  const supabase = await createServerClient()

  // Query base
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })

  // 🔍 Búsqueda en múltiples campos
  if (params.search) {
    const searchPattern = `%${params.search}%`
    query = query.or(
      `name.ilike.${searchPattern},` +
      `sku.ilike.${searchPattern},` +
      `description.ilike.${searchPattern}`
    )
  }

  // 📊 Ordenamiento
  query = query.order(params.sortBy, { 
    ascending: params.sortOrder === "asc" 
  })

  // 📄 Paginación (LIMIT + OFFSET)
  const from = (params.page - 1) * params.pageSize
  const to = from + params.pageSize - 1
  query = query.range(from, to)

  // Ejecutar query
  const { data, count, error } = await query

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`)
  }

  return {
    data: data || [],
    total: count || 0,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil((count || 0) / params.pageSize),
  }
}
```

## 📊 PASO 2: Definir Columnas

```tsx
// src/components/products/table/products-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/types/product.types"
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash } from "lucide-react"

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "image_url",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string
      return (
        <div className="w-12 h-12 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={row.getValue("name")}
              fill
              className="object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("name")}</div>
        <div className="text-sm text-muted-foreground">
          SKU: {row.original.sku}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(price)
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number
      return (
        <span
          className={
            stock > 10
              ? "text-green-600"
              : stock > 0
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {stock}
        </span>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creación" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleDateString("es-MX")
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

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
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

## 🎨 PASO 3: Componente Wrapper (opcional pero recomendado)

```tsx
// src/components/products/table/ProductsTable.tsx
"use client"

import { DataTableServer } from "@/components/shared/DataTableServer"
import { productsColumns } from "./products-columns"
import { getProductsPaginatedAction } from "@/lib/actions/productPaginationActions"
import { Product } from "@/types/product.types"

export function ProductsTable() {
  return (
    <DataTableServer<Product>
      columns={productsColumns}
      fetchData={getProductsPaginatedAction}
      queryKey="products"
      searchKey="name"
      searchPlaceholder="Buscar por nombre, SKU o descripción..."
      defaultSortBy="created_at"
    />
  )
}
```

## 🚀 PASO 4: Usar en tu página

```tsx
// src/app/dashboard/products/page.tsx
import { ProductsTable } from "@/components/products/table/ProductsTable"

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="text-muted-foreground">
          Gestiona todos tus productos
        </p>
      </div>
      
      <ProductsTable />
    </div>
  )
}
```

## ✅ ¡Listo!

Con estos 4 pasos tienes una tabla de productos con:
- ✅ Paginación server-side
- ✅ Búsqueda en múltiples campos
- ✅ Ordenamiento por columnas
- ✅ Cache automático con React Query
- ✅ Loading states
- ✅ Completamente tipado

## 🔁 Para otras entidades (Órdenes, Clientes, etc.)

Simplemente repite el patrón:
1. Server Action (`getXxxPaginatedAction`)
2. Columnas (`xxxColumns`)
3. Wrapper component (`XxxTable`)
4. Úsalo en la página

**El `DataTableServer` es 100% reutilizable!** 🎯
