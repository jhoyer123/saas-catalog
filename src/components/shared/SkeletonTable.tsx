export default function SkeletonTable() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Search */}
      <div className="h-10 w-full max-w-sm bg-gray-200 rounded animate-pulse" />

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-50 border-b">
          {[
            "Imagen",
            "Nombre",
            "Cod. Único",
            "Categoría",
            "Precio",
            "Oferta",
            "Acciones",
          ].map((col) => (
            <div key={col} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-4 px-4 py-4 border-b items-center"
          >
            {/* Imagen */}
            <div className="h-11 w-11 bg-gray-200 rounded animate-pulse" />
            {/* Nombre + marca */}
            <div className="flex flex-col gap-1">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* SKU */}
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            {/* Categoría */}
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            {/* Precio */}
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            {/* Oferta */}
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            {/* Acciones */}
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
