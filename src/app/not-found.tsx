"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react"; // Opcional: iconos para mejorar la UX

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        {/* Código de error */}
        <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">
          404
        </h1>

        {/* Mensaje principal */}
        <div className="bg-blue-600 text-white px-2 text-sm rounded rotate-12 absolute transform -translate-y-12 translate-x-24 hidden md:block">
          Página no encontrada
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mt-4">
          ¡Ups! Parece que te has perdido
        </h2>

        <p className="text-gray-500 mt-4 mb-8 max-w-md mx-auto">
          La página que buscas no existe o ha sido movida dentro del sistema.
          Verifica la URL o utiliza los botones de abajo para navegar.
        </p>

        {/* Acciones para el Dashboard */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Volver atrás
          </button>
        </div>
      </div>

      {/* Pie de página simple para el sistema */}
      <footer className="absolute bottom-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Sistema de catalago.
      </footer>
    </div>
  );
}
