"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  badge?: string;
}

export function ProductImageGallery({
  images,
  productName,
  badge,
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const goToNext = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <>
      {/* ── DESKTOP (md+) ── */}
      <div className="hidden md:flex md:flex-col md:gap-3">
        {/* Main image */}
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-gray-50 group"
          style={{ aspectRatio: "3/4" }}
        >
          {badge && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/80 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-white">
              {badge}
            </span>
          )}

          <button
            onClick={() => setZoomed(true)}
            className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <Image
            src={images[currentIndex] || "/placeholder-product.jpg"}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            priority
            sizes="(max-width: 1280px) 50vw, 640px"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails DEBAJO — sin border, solo opacidad + underline activo */}
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    index === currentIndex
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-70"
                  }`}
                  style={{ width: "72px", height: "72px" }}
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Underline premium — aparece solo en activo */}
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 bg-gray-900"
                      : "w-0 bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE (< md) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        <div
          className="relative w-full overflow-hidden bg-gray-50"
          style={{ aspectRatio: "3/4" }}
        >
          {badge && (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/80 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-white">
              {badge}
            </span>
          )}

          <Image
            src={images[currentIndex] || "/placeholder-product.jpg"}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-700 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/70 backdrop-blur-sm text-gray-700 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
              >
                <div
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    index === currentIndex
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-70"
                  }`}
                  style={{ width: "64px", height: "64px" }}
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "w-5 bg-gray-900" : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── ZOOM LIGHTBOX ── */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] aspect-3/4 w-full overflow-hidden">
            <Image
              src={images[currentIndex]}
              alt={productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase">
            Toca para cerrar
          </p>
        </div>
      )}
    </>
  );
}
