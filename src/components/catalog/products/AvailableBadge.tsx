import Image from "next/image";

/* export const AvailableBadge = () => {
  return (
    <div className="absolute bottom-2 left-2 z-10">
      <div className="relative w-13 h-13 md:w-20 md:h-20 bg-white rounded-full p-1">
        <Image
          src="/images/agotadoBlack.webp"
          alt="Agotado"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};
 */

export const AvailableBadge = () => {
  return (
    <div className="absolute bottom-2 left-0 z-10">
      <span
        className="
          inline-flex items-center font-inter
          /* Fondo de la familia Zinc/Slate con desenfoque */
          bg-zinc-900/85 backdrop-blur-md 
          /* Borde sutil para separar de fondos oscuros */
          border border-white/10
          /* Texto blanco puro con sombra para separar de fondos claros */
          text-white drop-shadow-md font-bold tracking-widest uppercase
          /* Tamaños adaptativos */
          text-[10px] px-2 py-0.5         /* Móvil */
          md:text-xs md:px-3 md:py-1      /* Tablet */
          lg:text-sm lg:px-4 lg:py-1.5    /* Desktop */
          transition-all duration-300
        "
      >
        Agotado
      </span>
    </div>
  );
};
