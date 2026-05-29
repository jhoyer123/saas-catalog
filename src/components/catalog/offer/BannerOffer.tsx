"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBannerCarousel } from "@/hooks/catalog/useBannerCarousel";
import { Banner } from "@/types/catalog/catalog.types";
import { useState } from "react";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

const FALLBACK_BANNER = "/images/placeholder.webp"; //fallback genérico para banners

interface BannerOfferProps {
  banners: Banner[];
}

// Hook de fallback (mismo patrón que en la galería)
/* function useBannerFallback(src: string) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return {
    imgSrc,
    onError: () => setImgSrc(FALLBACK_BANNER),
  };
} */
function useBannerFallback(src: string) {
  const [imgSrc, setImgSrc] = useState(src); // ← elimina el useEffect completamente

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
  const mobileSrc = getCatalogImageUrl(imgSrc, 768, 75);
  const desktopSrc = imgSrc;

  return (
    <picture>
      <source media="(max-width: 768px)" srcSet={mobileSrc} />
      <Image
        src={desktopSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={75}
        className="object-cover pointer-events-none"
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        onError={onError}
      />
    </picture>
  );
}

// Capa de seguridad si banners llega vacío
const EMPTY_BANNER: Banner = {
  id: "fallback",
  image_url: FALLBACK_BANNER,
};

const BannerOffer: React.FC<BannerOfferProps> = ({ banners }) => {
  const safeBanners = banners && banners.length > 0 ? banners : [EMPTY_BANNER];
  const isThereMultiple = banners && banners.length > 1;

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

  // When the client carousel mounts, remove the server-rendered LCP image to avoid duplication
  useEffect(() => {
    const el = document.getElementById("hero-lcp");
    if (el && el.parentElement) {
      el.parentElement.removeChild(el);
    }
    const wrapper = document.getElementById("hero-lcp-wrapper");
    if (wrapper && wrapper.parentElement) {
      wrapper.parentElement.removeChild(wrapper);
    }
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100 select-none md:rounded-lg"
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
          cursor: isThereMultiple
            ? isDragging.current
              ? "grabbing"
              : "grab"
            : "default",
        }}
        onPointerDown={isThereMultiple ? onPointerDown : undefined}
        onPointerMove={isThereMultiple ? onPointerMove : undefined}
        onPointerUp={isThereMultiple ? onPointerUp : undefined}
        onPointerCancel={isThereMultiple ? onPointerCancel : undefined}
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

      {isThereMultiple && ( // Solo mostrar controles si hay más de un banner
        <>
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
        </>
      )}
    </div>
  );
};

// When the client carousel mounts, remove the server-rendered LCP image to avoid duplication
useEffect(() => {
  const el = document.getElementById("hero-lcp");
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }
  const wrapper = document.getElementById("hero-lcp-wrapper");
  if (wrapper && wrapper.parentElement) {
    wrapper.parentElement.removeChild(wrapper);
  }
}, []);

export default BannerOffer;
