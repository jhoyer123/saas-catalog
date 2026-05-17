"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  itemsCount: number;
}

export default function Carousel({ children, itemsCount }: Props) {
  // Ajustes nativos de Embla eficientes para rendimiento
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    watchSlides: false, // Evita mutaciones innecesarias del DOM en producción
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Eliminado justify-center que rompía el layout de Embla */}
        <div className="flex touch-pan-y backface-hidden lg:justify-center">
          {children}
        </div>
      </div>

      {canPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="
            hidden lg:flex
            absolute left-2 top-1/2 -translate-y-1/2 z-10
            h-10 w-10 items-center justify-center
            rounded-full bg-white/90 shadow-md
          "
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {canNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="
            hidden lg:flex
            absolute right-2 top-1/2 -translate-y-1/2 z-10
            h-10 w-10 items-center justify-center
            rounded-full bg-white/90 shadow-md
          "
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
