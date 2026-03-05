"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationParams, PaginatedResponse } from "@/types/pagination.types";
import { useSessionData } from "@/hooks/auth/useSessionData";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 DEBOUNCED INPUT — Componente independiente y reutilizable
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Input con debounce integrado.
 * Úsalo dentro del prop `toolbar` de DataTableServer:
 *
 * ```tsx
 * toolbar={({ searchInput, setSearchInput, isLoading }) => (
 *   <div className="flex gap-2">
 *     <DebouncedInput
 *       value={searchInput}
 *       onChange={setSearchInput}
 *       placeholder="Buscar..."
 *       disabled={isLoading}
 *     />
 *     <Button>Filtro extra</Button>
 *   </div>
 * )}
 * ```
 */
interface DebouncedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
}

export function DebouncedInput({
  value,
  onChange,
  ...props
}: DebouncedInputProps) {
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * 📊 DATATABLE GENÉRICO CON SERVER-SIDE PAGINATION
 *
 * Componente 100% REUTILIZABLE para cualquier entidad (categorías, productos, órdenes, etc.)
 * Maneja paginación, búsqueda y ordenamiento en el SERVIDOR
 * No carga todos los datos, solo la página actual
 *
 * Props:
 * @param TData - Tipo genérico de los datos (Category, Product, Order, etc.)
 * @param columns - Definición de columnas de TanStack Table
 * @param fetchData - Función que llama al servidor (Server Action o API)
 * @param queryKey - Clave única de React Query (ej: "categories", "products")
 * @param searchKey - Campo por el cual buscar (opcional)
 * @param searchPlaceholder - Placeholder del input de búsqueda
 * @param defaultSortBy - Campo de ordenamiento por defecto
 *
 * 🎯 EJEMPLO DE USO:
 *
 * ```tsx
 * <DataTableServer<Category>
 *   columns={categoriesColumns}
 *   fetchData={getCategoriesPaginatedAction}
 *   queryKey="categories"
 *   searchKey="name"
 *   searchPlaceholder="Buscar categorías..."
 * />
 * ```
 */
/**
 * Props del toolbar render prop.
 * Recibe el estado de búsqueda para que puedas colocar
 * DebouncedInput (u otro input) donde y como quieras.
 */
export interface DataTableToolbarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  isLoading: boolean;
}

interface DataTableServerProps<TData> {
  columns: ColumnDef<TData, any>[];
  fetchData: (
    params: PaginationParams,
    storeId: string,
  ) => Promise<PaginatedResponse<TData>>;
  queryKey: string;
  /** @deprecated Usa el prop `toolbar` para renderizar tu propio input */
  searchKey?: string;
  /** @deprecated Usa el prop `toolbar` para renderizar tu propio input */
  searchPlaceholder?: string;
  defaultSortBy?: string;
  /**
   * Render prop para la barra de herramientas (búsqueda, filtros, botones, etc.).
   * Recibe `{ searchInput, setSearchInput, isLoading }` para conectar DebouncedInput.
   *
   * @example
   * ```tsx
   * toolbar={({ searchInput, setSearchInput, isLoading }) => (
   *   <div className="flex gap-2">
   *     <DebouncedInput
   *       value={searchInput}
   *       onChange={setSearchInput}
   *       placeholder="Buscar productos..."
   *       disabled={isLoading}
   *       className="max-w-sm"
   *     />
   *     <Button variant="outline">Exportar</Button>
   *   </div>
   * )}
   * ```
   */
  toolbar?: (props: DataTableToolbarProps) => React.ReactNode;
}

export function DataTableServer<TData>({
  columns,
  fetchData,
  queryKey,
  searchKey,
  searchPlaceholder = "Buscar...",
  defaultSortBy = "created_at",
  toolbar,
}: DataTableServerProps<TData>) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1️⃣ ESTADOS LOCALES (Estos controlan la paginación)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 📄 Estado de paginación (página actual y tamaño)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack usa índice base-0, convertimos a base-1 para el servidor
    pageSize: 10,
  });

  // Obtener el storeId desde el contexto o props (si no está disponible, se puede usar un fallback)
  const { data: sessionData } = useSessionData();

  // 🔍 Estado de búsqueda (con debounce)
  const [searchInput, setSearchInput] = useState(""); // Valor inmediato del input
  const [search, setSearch] = useState(""); // Valor que dispara la query (después de debounce)

  // 📊 Estado de ordenamiento
  const [sorting, setSorting] = useState<SortingState>([]);

  // ⏱️ DEBOUNCE: Espera 500ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput); // Actualiza el search real después del delay
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Resetear a página 1
    }, 500); // 500ms de espera

    // Cleanup: Cancela el timer si el usuario sigue escribiendo
    return () => clearTimeout(timer);
  }, [searchInput]); // Se ejecuta cada vez que cambia searchInput

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2️⃣ FETCHING DE DATOS (React Query + Server-Side)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Obtener columna y dirección de ordenamiento
  const sortBy = sorting[0]?.id || defaultSortBy;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  // 🎣 React Query para fetching con cache automático
  const { data: response, isLoading } = useQuery({
    // queryKey con TODOS los parámetros (para invalidar cache correctamente)
    queryKey: [
      queryKey,
      pagination.pageIndex + 1,
      pagination.pageSize,
      search,
      sortBy,
      sortOrder,
    ],
    // Función que llama al serv idor
    queryFn: () =>
      fetchData(
        {
          page: pagination.pageIndex + 1, // Convertir índice base-0 a base-1
          pageSize: pagination.pageSize,
          search,
          sortBy,
          sortOrder,
        },
        sessionData?.store?.id!,
      ), // Pasar storeId al fetchData
    // Configuración de cache
    staleTime: 30_000, // Datos frescos por 30 segundos
  });

  // Extraer datos de la respuesta (con fallbacks)
  const data = response?.data || [];
  const totalRows = response?.total || 0;
  const totalPages = response?.totalPages || 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3️⃣ CONFIGURACIÓN DE TANSTACK TABLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const table = useReactTable({
    data,
    columns,

    // 🔧 Configuración de paginación MANUAL (server-side)
    manualPagination: true, // ⚠️ CLAVE: Le dice a TanStack que NO pagine en el cliente
    pageCount: totalPages, // Total de páginas calculado por el servidor

    // 🔧 Configuración de ordenamiento MANUAL
    manualSorting: true, // ⚠️ CLAVE: El ordenamiento lo hace el servidor

    // 🔧 Estado
    state: {
      pagination,
      sorting,
    },

    // 🔧 Handlers de cambio de estado
    onPaginationChange: setPagination,
    onSortingChange: setSorting,

    // Modelos
    getCoreRowModel: getCoreRowModel(),
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4️⃣ UI - RENDERIZADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div className="space-y-4">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TOOLBAR (búsqueda, filtros, botones, etc.) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {toolbar
        ? toolbar({ searchInput, setSearchInput, isLoading })
        : searchKey && (
            // Fallback: input simple para compatibilidad con uso anterior
            <div className="flex items-center">
              <Input
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="max-w-sm"
                disabled={isLoading}
              />
            </div>
          )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* TABLA */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // 🔄 Loading state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              // ✅ Datos disponibles
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // ❌ Sin resultados
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* PAGINACIÓN */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col md:flex-row items-center justify-between px-2">
        {/* Contador de resultados */}
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando{" "}
          {data.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0}{" "}
          a{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalRows,
          )}{" "}
          de {totalRows} resultado(s)
        </div>

        <div className="flex flex-col md:flex-row items-center space-x-6 lg:space-x-8">
          {/* Selector de filas por página */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              className="h-8 w-17.5 rounded-md border border-input bg-background px-2 text-sm"
              value={pagination.pageSize}
              onChange={(e) => {
                setPagination({
                  pageIndex: 0, // Resetear a página 1
                  pageSize: Number(e.target.value),
                });
              }}
              disabled={isLoading}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center text-sm font-medium">
            {/* Info de página */}
            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Página {pagination.pageIndex + 1} de {totalPages || 1}
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center space-x-2">
              {/* Primera página */}
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }
                disabled={!table.getCanPreviousPage() || isLoading}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Página anterior */}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Página siguiente */}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Última página */}
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: totalPages - 1,
                  }))
                }
                disabled={!table.getCanNextPage() || isLoading}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🎯 CÓMO FUNCIONA:
 *
 * 1. Usuario cambia algo (página, búsqueda, orden)
 *    ↓
 * 2. Estado local se actualiza (useState)
 *    ↓
 * 3. React Query detecta cambio en queryKey
 *    ↓
 * 4. Se hace petición al servidor con fetchData()
 *    ↓
 * 5. Servidor responde con SOLO los datos de esa página
 *    ↓
 * 6. React Query actualiza el cache
 *    ↓
 * 7. Componente se re-renderiza con nuevos datos
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 🔍 CÓMO USAR PARA OTRAS ENTIDADES (PRODUCTOS, ÓRDENES, ETC.):
 *
 * PASO 1: Crear Server Action (ejemplo para productos):
 *
 * ```typescript
 * // src/lib/actions/productPaginationActions.ts
 * "use server"
 *
 * export async function getProductsPaginatedAction(params: PaginationParams) {
 *   const supabase = await createServerClient()
 *
 *   let query = supabase.from("products").select("*", { count: "exact" })
 *
 *   if (params.search) {
 *     query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`)
 *   }
 *
 *   query = query
 *     .order(params.sortBy, { ascending: params.sortOrder === "asc" })
 *     .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1)
 *
 *   const { data, count, error } = await query
 *
 *   if (error) throw new Error(error.message)
 *
 *   return {
 *     data: data || [],
 *     total: count || 0,
 *     page: params.page,
 *     pageSize: params.pageSize,
 *     totalPages: Math.ceil((count || 0) / params.pageSize),
 *   }
 * }
 * ```
 *
 * PASO 2: Crear columnas (ejemplo para productos):
 *
 * ```tsx
 * // src/components/products/table/products-columns.tsx
 * import { ColumnDef } from "@tanstack/react-table"
 * import { Product } from "@/types/product.types"
 *
 * export const productsColumns: ColumnDef<Product>[] = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Nombre" />
 *     ),
 *   },
 *   {
 *     accessorKey: "price",
 *     header: "Precio",
 *     cell: ({ row }) => {
 *       const price = parseFloat(row.getValue("price"))
 *       return new Intl.NumberFormat("es-MX", {
 *         style: "currency",
 *         currency: "MXN",
 *       }).format(price)
 *     },
 *   },
 *   // ... más columnas
 * ]
 * ```
 *
 * PASO 3: Usar en tu página/componente:
 *
 * ```tsx
 * // src/app/dashboard/products/page.tsx
 * import { DataTableServer } from "@/components/shared/DataTableServer"
 * import { productsColumns } from "@/components/products/table/products-columns"
 * import { getProductsPaginatedAction } from "@/lib/actions/productPaginationActions"
 *
 * export default function ProductsPage() {
 *   return (
 *     <DataTableServer<Product>
 *       columns={productsColumns}
 *       fetchData={getProductsPaginatedAction}
 *       queryKey="products"
 *       searchKey="name"
 *       searchPlaceholder="Buscar por nombre o SKU..."
 *       defaultSortBy="name"
 *     />
 *   )
 * }
 * ```
 *
 * ✅ ¡Y listo! Ahora tienes paginación server-side para productos.
 * 🔄 React Query maneja el cache automáticamente.
 * 🎯 Simplemente repite para cualquier otra entidad.
 */
