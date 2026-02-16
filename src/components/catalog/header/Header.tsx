"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Funnel, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onOpenFilters?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchValue = "",
  onSearchChange,
  onOpenFilters,
}) => {
  return (
    <header className="bg-white border-b w-full sticky top-0 z-20">
      <div className="container mx-auto py-2 flex flex-col items-center justify-between gap-4">
        {/* Logo - name store*/}
        <div className="flex items-center justify-between w-full px-4">
          {/* logo */}
          <Link href="/public/catalog">
            <Image
              src="/images/logoTienda.jpg"
              alt="Logo de la Tienda"
              width={40}
              height={40}
            />
          </Link>
          {/* name store */}
          <h1 className="text-2xl font-semibold text-gray-800">Glass Store</h1>
          {/* user - session */}
          <Button variant="outline" size="sm">
            <ShoppingCart />
          </Button>
        </div>

        {/* Search Bar - filter*/}
        <div className="w-full max-w-md px-4 flex items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
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
