"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Funnel, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";
import { CartButton } from "@/components/cart/CartButton";

interface HeaderProps {
  store: { name: string; slug: string; logo_url: string | null; whatsapp_number?: string | null };
  onOpenFilters?: () => void;
}

const Header: React.FC<HeaderProps> = ({ store, onOpenFilters }) => {
  const { searchInput, setSearchInput } = useProductFilter();

  return (
    <header className="bg-white border-b w-full sticky top-0 z-20">
      <div className="container mx-auto py-2 flex flex-col items-center justify-between gap-4 md:py-1">
        {/* Logo - name store*/}
        <div className="flex items-center justify-between w-full px-4">
          {/* logo */}
          <Link href={`/public/${store.slug}`}>
            <Image
              src={store.logo_url || "/images/store-placeholder.png"}
              alt="Logo de la Tienda"
              width={200}
              height={200}
              className="w-12 h-12 lg:w-15 lg:h-15 object-contain"
            />
          </Link>
          {/* name store */}
          <h1 className="text-2xl font-semibold text-gray-800">{store.name}</h1>
          {/* Carrito de compras */}
          <CartButton whatsappNumber={store.whatsapp_number} />
        </div>

        {/* Search Bar - filter*/}
        <div className="w-full max-w-md px-4 flex items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="lg:hidden"
          >
            <Funnel />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
