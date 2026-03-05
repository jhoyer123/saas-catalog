"use client";

import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <h1 className="text-[150px] md:text-[200px] font-black text-[#3d3d3d] leading-none">
        ¡Ups!
      </h1>

      <h2 className="text-xl md:text-2xl font-bold text-[#3d3d3d] mt-2">
        Error al cargar el producto
      </h2>

      <p className="text-gray-500 mt-3 text-sm md:text-base max-w-md">
        No pudimos obtener la información de este producto. Puedes intentar de
        nuevo o regresar al catálogo anterior.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-8 py-2.5 bg-[#3d3d3d] text-white font-semibold rounded hover:bg-black transition-all duration-200 text-sm"
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => router.back()}
          className="px-8 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded hover:border-gray-500 transition-all duration-200 text-sm"
        >
          Regresar
        </button>
      </div>
    </div>
  );
}
