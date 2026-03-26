"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import BannerForm from "../banner/BannerForm";
import { Plan } from "@/types/plan.types";

// ============================================
// COMPONENTE
// ============================================

export const BannerPreview = ({
  banners,
  plan,
}: {
  banners: string[];
  plan?: Plan;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // ============================================
  // RENDER - MODO EDICIÓN
  // ============================================

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-sm font-medium text-gray-700">Banners</h2>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm text-blue-500 hover:text-gray-700 underline"
          >
            Cancelar
          </button>
        </div>
        <BannerForm existingBanners={banners} setIsEditing={setIsEditing} plan={plan} />
      </div>
    );
  }

  // ============================================
  // RENDER - MODO VISUALIZACIÓN
  // ============================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">
          Banners{" "}
          <span className="text-gray-400 font-normal">
            ({banners.length}/3)
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar banners
        </button>
      </div>

      {/* Grid vertical */}
      {banners.length === 0 ? (
        <div
          onClick={() => setIsEditing(true)}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <p className="text-sm text-gray-500">No hay banners aún</p>
          <p className="text-xs text-gray-400">Haz clic para añadir</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {banners.map((url, index) => (
            <div
              key={url}
              className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200"
            >
              <Image
                src={url}
                alt={`Banner ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1300px"
                className="object-cover"
                loading="eager"
                priority
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
