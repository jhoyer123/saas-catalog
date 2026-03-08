"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerCarousel } from "@/hooks/catalog/useBannerCarousel";
import { Banner } from "@/types/catalog/catalog.types";

interface BannerOfferProps {
  banners: Banner[];
}

const BannerOffer: React.FC<BannerOfferProps> = ({ banners }) => {
  const {
    currentIndex,
    isAnimating,
    translateX,
    trackRef,
    clearTimer,
    startTimer,
    isDragging,
    goTo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useBannerCarousel(banners);

  return (
    <div
      className="relative w-full overflow-hidden shadow-lg bg-gray-100 select-none md:rounded-lg"
      aria-label="Carrusel de ofertas"
      onMouseEnter={clearTimer}
      onMouseLeave={() => !isDragging.current && startTimer()}
    >
      {/* Track: se mueve horizontalmente según translateX */}
      <div
        ref={trackRef}
        className="flex will-change-transform touch-pan-y"
        style={{
          transform: `translateX(${translateX}%)`,
          transition:
            isAnimating && !isDragging.current
              ? "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)"
              : "none",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDragStart={(e) => e.preventDefault()}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="relative w-full shrink-0 aspect-video"
            aria-hidden={index !== currentIndex}
          >
            <Image
              src={banner.image_url}
              alt={`Banner ${index + 1}`}
              quality={80}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover pointer-events-none"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Flechas de navegación */}
      <button
        onClick={() => goTo(currentIndex - 1)}
        aria-label="Banner anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goTo(currentIndex + 1)}
        aria-label="Banner siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots: indican en qué banner estás */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        role="tablist"
      >
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Banner ${index + 1}`}
            onClick={() => goTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-6" : "bg-white/50 w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerOffer;
