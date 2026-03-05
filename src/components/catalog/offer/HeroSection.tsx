"use client";

import React from "react";
import BannerOffer from "@/components/catalog/offer/BannerOffer";
import { Banner } from "@/types/catalog/catalog.types";

interface HeroSectionProps {
  banners: Banner[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ banners }) => {
  return (
    <div className="w-full">
      {/* seccion del banner */}
      <section className="flex py-2 flex-col items-center justify-center gap-1 w-full max-w-2xl mx-auto">
        <BannerOffer banners={banners} />
      </section>
    </div>
  );
};

export default HeroSection;
