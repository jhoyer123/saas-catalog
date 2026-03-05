"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
          <h1 className="text-[150px] md:text-[200px] font-black text-[#3d3d3d] leading-none">
            500
          </h1>

          <h2 className="text-xl md:text-2xl font-bold text-[#3d3d3d] mt-2">
            Error del servidor
          </h2>

          <p className="text-gray-500 mt-3 text-sm md:text-base max-w-md">
            Ocurrió un problema inesperado en el sistema. Si el error persiste,
            por favor contacta a soporte para que podamos ayudarte.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="px-8 py-2.5 bg-[#3d3d3d] text-white font-semibold rounded hover:bg-black transition-all duration-200 text-sm"
            >
              Intentar de nuevo
            </button>

            <a
              href="mailto:jhoyervg@gmail.coms"
              className="px-8 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded hover:border-gray-500 transition-all duration-200 text-sm"
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
