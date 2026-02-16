"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  setPage,
}: ProductPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Función para cambiar de página y hacer scroll al inicio
  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll suave al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 w-full max-w-7xl mt-5">
      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>

        {/* Números de página */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="min-w-10"
              >
                {page}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                {page}
              </span>
            ),
          )}
        </div>

        {/* Página actual en móvil */}
        <div className="sm:hidden text-sm text-gray-600">
          Pág. {currentPage} de {totalPages}
        </div>

        {/* Botón siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
