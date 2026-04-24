"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart/CartButton";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";
import { StoreCatalogData } from "@/types/catalog/catalog.types";

interface HeaderProps {
  store: StoreCatalogData;
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  return (
    <header
      id="catalog-header"
      className="bg-catalog-primary/80 border-b w-full fixed top-0 left-0 right-0 z-20"
    >
      <div className="container mx-auto px-1.5 py-1 flex items-center justify-between md:px-6 lg:px-35">
        <Link href={`/public/${store.slug}`}>
          <Image
            src={
              store.logo_url
                ? `${getCatalogImageUrl(store.logo_url)}?v=${new Date(store.updated_at).getTime()}`
                : "/images/store-placeholder.png"
            }
            alt="Logo de la Tienda"
            width={200}
            height={200}
            className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
          />
        </Link>
        <h1 className="text-lg font-semibold text-catalog-secondary text-center md:text-2xl">
          {store.name}
        </h1>
        <CartButton whatsappNumber={store.whatsapp_number} />
      </div>
    </header>
  );
};

export default Header;
