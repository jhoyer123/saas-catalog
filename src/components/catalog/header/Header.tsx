"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart/CartButton";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

interface HeaderProps {
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number?: string | null;
    updated_at: string;
  };
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  return (
    <header
      id="catalog-header"
      className="bg-white border-b w-full fixed top-0 left-0 right-0 z-20"
    >
      <div className="container mx-auto px-4 py-2 md:py-1 flex items-center justify-between">
        <Link href={`/public/${store.slug}`}>
          <Image
            //src={store.logo_url || "/images/store-placeholder.png"}
            src={
              store.logo_url
                ? `${getCatalogImageUrl(store.logo_url)}?v=${new Date(store.updated_at).getTime()}`
                : "/images/store-placeholder.png"
            }
            alt="Logo de la Tienda"
            width={200}
            height={200}
            className="w-12 h-12 lg:w-15 lg:h-15 object-contain"
            loading="eager"
          />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          {store.name}
        </h1>
        <CartButton whatsappNumber={store.whatsapp_number} />
      </div>
    </header>
  );
};

export default Header;
