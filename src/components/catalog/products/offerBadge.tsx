import React from "react";

interface OfferBadgeProps {
  discountPercent: number;
}

export const OfferBadge = ({ discountPercent }: OfferBadgeProps) => {
  return (
    <div className="absolute top-0 left-2 sm:left-3 z-10">
      <div className="relative bg-linear-to-b from-red-500 to-rose-600 text-white font-bold shadow-md tracking-wide flex flex-col items-center gap-0.5 min-w-7 sm:min-w-9 px-1.5 sm:px-2.5 pt-0.5 sm:pt-1 pb-2 sm:pb-3">
        <svg
          viewBox="0 0 24 24"
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span className="text-[9px] sm:text-[11px]">-{discountPercent}%</span>
        <div className="absolute -bottom-1.5 sm:-bottom-2 left-0 right-0 flex">
          <div
            className="w-1/2 h-1.5 sm:h-2 bg-rose-600"
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          />
          <div
            className="w-1/2 h-1.5 sm:h-2 bg-rose-600"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
          />
        </div>
      </div>
    </div>
  );
};
