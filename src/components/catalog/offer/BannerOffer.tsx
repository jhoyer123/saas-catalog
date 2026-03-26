"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerCarousel } from "@/hooks/catalog/useBannerCarousel";
import { Banner } from "@/types/catalog/catalog.types";
import { useState, useEffect } from "react";

const FALLBACK_BANNER = "/images/placeholder.webp"; //fallback genérico para banners

interface BannerOfferProps {
  banners: Banner[];
}

// Hook de fallback (mismo patrón que en la galería)
function useBannerFallback(src: string) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return {
    imgSrc,
    onError: () => setImgSrc(FALLBACK_BANNER),
  };
}

// Wrapper por banner individual
function BannerImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const { imgSrc, onError } = useBannerFallback(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      quality={75}
      fill
      sizes="(max-width: 768px) 100vw, 80vw"
      className="object-cover pointer-events-none"
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
      onError={onError}
    />
  );
}

// Capa de seguridad si banners llega vacío
const EMPTY_BANNER: Banner = {
  id: "fallback",
  image_url: FALLBACK_BANNER,
};

const BannerOffer: React.FC<BannerOfferProps> = ({ banners }) => {
  const safeBanners = banners && banners.length > 0 ? banners : [EMPTY_BANNER];

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
  } = useBannerCarousel(safeBanners);

  return (
    <div
      className="relative w-full overflow-hidden shadow-lg bg-gray-100 select-none md:rounded-lg"
      aria-label="Carrusel de ofertas"
      onMouseEnter={clearTimer}
      onMouseLeave={() => !isDragging.current && startTimer()}
    >
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
        {safeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className="relative w-full shrink-0 aspect-video"
            aria-hidden={index !== currentIndex}
          >
            <BannerImage
              src={banner.image_url}
              alt={`Banner ${index + 1}`}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

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

      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        role="tablist"
      >
        {safeBanners.map((banner, index) => (
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
