import { X } from "lucide-react";
import Image from "next/image";

/**
 * Card for input file previews. Shows the image and a button to remove it for products.
 */
interface ImageCardProps {
  url: string;
  onRemove: () => void;
  disabled: boolean;
}

export function ProductCard({ url, onRemove, disabled }: ImageCardProps) {
  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <Image
        src={url}
        alt="Preview"
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
        loading="lazy"
      />

      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * card for input file previews. Shows the image and a button to remove it for banners.
 */
interface BannerCardProps {
  url: string;
  onRemove: () => void;
  disabled: boolean;
}

export function BannerCard({ url, onRemove, disabled }: BannerCardProps) {
  return (
    <div className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors">
      <Image
        src={url}
        alt="Banner preview"
        fill
        sizes="(max-width: 768px) 100vw, 75vw"
        className="object-cover"
        loading="lazy"
      />

      {!disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
