"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { OfferBadge } from "./offerBadge";
import { AvailableBadge } from "./AvailableBadge";

const FALLBACK_IMAGE = "/images/placeholder.webp";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent?: number | null;
  is_available: boolean;
}

// Hook por imagen individual
function useImageFallback(src: string) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return {
    imgSrc,
    onError: () => setImgSrc(FALLBACK_IMAGE),
  };
}

// Wrapper de imagen con fallback
function GalleryImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { imgSrc, onError } = useImageFallback(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      quality={75}
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
      className={`pointer-events-none ${className ?? ""}`}
      onError={onError}
    />
  );
}

// Lightbox con pinch-to-zoom para móviles, usando el mismo componente GalleryImage con fallback integrado
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const lastDistance = useRef<number | null>(null);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);

      if (lastDistance.current) {
        const ratio = distance / lastDistance.current;
        setScale((prev) => Math.min(Math.max(prev * ratio, 1), 3));
      }

      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] w-full overflow-hidden"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="90vw"
          className="object-contain transition-transform duration-75"
          style={{
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

export function ProductImageGallery({
  images,
  productName,
  discountPercent,
  is_available,
}: ProductImageGalleryProps) {
  // Capa de seguridad: array vacío o undefined → fallback
  const safeImages = images && images.length > 0 ? images : [FALLBACK_IMAGE];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));

  const goToNext = () =>
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? goToNext() : goToPrevious();
    }
    touchStartX.current = null;
  };

  const lightbox =
    zoomed && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw] aspect-3/4 w-full overflow-hidden">
              <GalleryImage
                src={safeImages[currentIndex]}
                alt={productName}
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase">
              Toca para cerrar
            </p>
          </div>,
          document.body,
        )
      : null;

  const ImageStack = ({ isMobile }: { isMobile: boolean }) => (
    <div
      className={`relative w-full overflow-hidden bg-gray-100 aspect-square ${
        isMobile
          ? "touch-pan-y select-none"
          : "max-w-150 mx-auto rounded-2xl group select-none"
      }`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {discountPercent && <OfferBadge discountPercent={discountPercent} />}
      {!is_available && <AvailableBadge />}

      {/* {!isMobile && (
        <button
          onClick={() => setZoomed(true)}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      )} */}

      <div
        onClick={() => setZoomed(true)}
        className="absolute inset-0 z-10 cursor-zoom-in"
      />

      {safeImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 ${
            isMobile ? "transition-none" : "transition-opacity duration-300"
          }`}
          style={{
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? "auto" : "none",
          }}
          aria-hidden={index !== currentIndex}
        >
          <GalleryImage
            src={src}
            alt={`${productName} - Imagen ${index + 1}`}
            sizes={isMobile ? "100vw" : "(max-width: 1280px) 50vw, 640px"}
            priority={index === 0}
            className={`object-cover ${
              !isMobile
                ? "transition-transform duration-700 group-hover:scale-[1.03]"
                : ""
            }`}
          />
        </div>
      ))}

      {safeImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white shadow-sm ${
              !isMobile
                ? "opacity-0 group-hover:opacity-100 transition-colors duration-200 hover:bg-black/60"
                : ""
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white shadow-sm ${
              !isMobile
                ? "opacity-0 group-hover:opacity-100 transition-colors duration-200 hover:bg-black/60"
                : ""
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );

  const Thumbnails = ({
    size,
    isMobile,
  }: {
    size: number;
    isMobile: boolean;
  }) => (
    <div className="flex gap-2 items-center justify-center overflow-x-auto pb-1">
      {safeImages.map((image, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
        >
          <div
            className={`relative overflow-hidden rounded-xl ${
              isMobile ? "transition-none" : "transition-opacity duration-300"
            } ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-40 hover:opacity-70"
            }`}
            style={{ width: size, height: size }}
          >
            <GalleryImage
              src={image}
              alt={`${productName} ${index + 1}`}
              sizes={`${size}px`}
              className="object-cover"
            />
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:gap-3">
        <ImageStack isMobile={false} />
        {safeImages.length > 1 && <Thumbnails size={72} isMobile={false} />}
      </div>

      {/* MOBILE */}
      <div className="flex flex-col gap-3 lg:hidden">
        <ImageStack isMobile={true} />
        {safeImages.length > 1 && <Thumbnails size={64} isMobile={true} />}
      </div>

      {lightbox}
    </>
  );
}
