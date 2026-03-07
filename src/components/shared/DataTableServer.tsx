"use client";

import { useState, useRef } from "react";
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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationParams, PaginatedResponse } from "@/types/pagination.types";

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
  fetchData: (params: PaginationParams) => Promise<PaginatedResponse<TData>>;
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
  // Estado de paginación (página actual y tamaño)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack usa índice base-0, convertimos a base-1 para el servidor
    pageSize: 10,
  });

  // Un solo estado para búsqueda
  const [search, setSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearch(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
  };

  // Estado de ordenamiento
  const [sorting, setSorting] = useState<SortingState>([]);

  //FETCHING DE DATOS (React Query + Server-Side)

  // Obtener columna y dirección de ordenamiento
  const sortBy = sorting[0]?.id || defaultSortBy;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

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
    queryFn: () =>
      fetchData({
        page: pagination.pageIndex + 1, // Convertir índice base-0 a base-1
        pageSize: pagination.pageSize,
        search,
        sortBy,
        sortOrder,
      }),
    staleTime: 30_000, // 30 segundos de cache
  });

  // Extraer datos de la respuesta (con fallbacks)
  const data = response?.data || [];
  const totalRows = response?.total || 0;
  const totalPages = response?.totalPages || 0;

  // CONFIGURACIÓN DE TANSTACK TABLE
  const table = useReactTable({
    data,
    columns,
    //Configuración de paginación MANUAL (server-side)
    manualPagination: true, //Le dice a TanStack que NO pagine en el cliente
    pageCount: totalPages, // Total de páginas calculado por el servidor
    //Configuración de ordenamiento MANUAL
    manualSorting: true, // El ordenamiento lo hace el servidor
    enableMultiSort: false, // ← esto
    // Estado
    state: {
      pagination,
      sorting,
    },
    // Handlers de cambio de estado
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    // Modelos
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* TOOLBAR (búsqueda, filtros, botones, etc.) */}
      {toolbar
        ? toolbar({
            searchInput: search,
            setSearchInput: handleSearch,
            isLoading,
          })
        : searchKey && (
            // Fallback: input simple para compatibilidad con uso anterior
            <div className="flex items-center">
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
                disabled={isLoading}
              />
            </div>
          )}

      {/* TABLA */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center gap-1 cursor-pointer select-none"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <>
                            {header.column.getIsSorted() === "asc" && (
                              <ArrowUp className="h-4 w-4" />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ArrowDown className="h-4 w-4" />
                            )}
                            {!header.column.getIsSorted() && (
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
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
              {[10, 20, 30].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          {/* Navegación de páginas */}
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
