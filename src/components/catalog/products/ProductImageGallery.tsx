"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Layout para LG y superiores - Miniaturas DEBAJO como en la imagen */}
      <div className="hidden lg:flex lg:flex-col lg:space-y-4">
        {/* Imagen principal */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
          {/* Badge */}
          {badge && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              {badge}
            </div>
          )}

          {/* Imagen */}
          <Image
            src={images[currentIndex] || "/placeholder-product.jpg"}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 50vw, 600px"
          />

          {/* Controles de navegación - Solo si hay múltiples imágenes */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Indicadores de imagen */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas DEBAJO en horizontal - Como en la imagen */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentIndex
                    ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layout para MD - Miniaturas AL LADO */}
      <div className="hidden md:flex md:gap-4 lg:hidden">
        {/* Miniaturas al lado IZQUIERDO */}
        {images.length > 1 && (
          <div className="flex flex-col gap-4 w-24 shrink-0">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentIndex
                    ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Imagen principal */}
        <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-gray-100">
          {/* Badge */}
          {badge && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              {badge}
            </div>
          )}

          {/* Imagen */}
          <Image
            src={images[currentIndex] || "/placeholder-product.jpg"}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Layout MÓVIL - Miniaturas DEBAJO en grid */}
      <div className="flex flex-col space-y-4 md:hidden">
        {/* Imagen principal */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
          {/* Badge */}
          {badge && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              {badge}
            </div>
          )}

          {/* Imagen */}
          <Image
            src={images[currentIndex] || "/placeholder-product.jpg"}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas DEBAJO en grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentIndex
                    ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
