export const OverlayProcess = () => {
  return (
    <div className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-xl">
        <span className="text-sm text-gray-600">Procesando...</span>
      </div>
    </div>
  );
};
