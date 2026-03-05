const SketetonStoreConfig = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-pulse">
      {/* TITLE */}
      <div className="h-8 w-72 bg-gray-200 rounded-md" />

      {/* CONFIG CARD */}
      <div className="w-full border rounded-xl p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="h-5 w-64 bg-gray-200 rounded-md" />
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="h-5 w-40 bg-gray-200 rounded-md" />
            <div className="w-32 h-32 bg-gray-200 rounded-xl" />
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="h-4 w-44 bg-gray-200 rounded-md" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded-md" />
          <div className="h-32 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* BANNERS CARD */}
      <div className="w-full border rounded-xl p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-72 bg-gray-200 rounded-md" />
          <div className="h-4 w-28 bg-gray-200 rounded-md" />
        </div>

        {/* Banner Preview */}
        <div className="w-full aspect-16/6 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};

export default SketetonStoreConfig;
