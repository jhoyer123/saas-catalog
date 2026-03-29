import Image from "next/image";

export const AvailableBadge = () => {
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
