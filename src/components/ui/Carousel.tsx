"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  itemsCount: number;
}

export default function Carousel({ children, itemsCount }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
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
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div
          className={clsx(
            "flex touch-pan-y",
            itemsCount <= 2 && "justify-center",
          )}
        >
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
