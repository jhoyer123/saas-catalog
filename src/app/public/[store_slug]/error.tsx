"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CatalogError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col gap-10 items-center justify-center min-h-screen bg-white px-6 text-center">
      <h1 className="text-[100px] md:text-[200px] font-black text-[#3d3d3d] leading-none">
        ¡Ups!
      </h1>

      <h2 className="text-xl md:text-2xl font-bold text-[#3d3d3d] mt-2">
        Error al cargar el catálogo
      </h2>

      <p className="text-gray-500 mt-3 text-sm md:text-base max-w-md">
        No pudimos cargar los productos en este momento. Intenta de nuevo o
        contacta a soporte si el problema continúa.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-8 py-2.5 bg-[#3d3d3d] text-white font-semibold rounded hover:bg-black transition-all duration-200 text-sm"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
