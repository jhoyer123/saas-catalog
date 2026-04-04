export default function CatalogNotAvailable({ handle }: { handle?: string }) {
  return (
    <div
      className="relative min-h-screen bg-[#111110] flex flex-col items-center justify-center overflow-hidden px-8 py-12"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      {/* Marco decorativo */}
      <div className="absolute inset-5 border border-white/10 pointer-events-none" />
      <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-white/50" />
      <div className="absolute top-5 right-5 w-4 h-4 border-t border-r border-white/50" />
      <div className="absolute bottom-5 left-5 w-4 h-4 border-b border-l border-white/50" />
      <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-white/50" />

      {/* Icono */}
      <div className="mb-8 opacity-40">
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 24s6-10 18-10 18 10 18 10-6 10-18 10S6 24 6 24z" />
          <circle cx="24" cy="24" r="4" />
          <line x1="8" y1="8" x2="40" y2="40" />
        </svg>
      </div>

      <p className="text-[11px] tracking-[0.25em] text-white/40 uppercase font-light mb-6">
        Temporalmente cerrado
      </p>

      {/* Título */}
      <div className="flex flex-col items-center gap-2 mb-8 text-wrap justify-center lg:flex-row">
        <span
          className="text-4xl md:text-[80px] font-light text-white/10 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          No
        </span>
        <span className="text-4xl md:text-[80px] font-light text-white/10 leading-none">
          Disponible
        </span>
        <span
          className="text-4xl md:text-[80px] font-light text-white/10 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          ahora
        </span>
      </div>

      <div className="w-10 h-px bg-white/20 mb-6" />

      <p className="text-[12px] tracking-[0.15em] text-white/35 uppercase font-light mb-10">
        Volvemos pronto
      </p>

      <div className="border border-white/20 text-white/50 text-[11px] tracking-[0.2em] uppercase font-light px-8 py-3">
        Mantente atento
      </div>
    </div>
  );
}
