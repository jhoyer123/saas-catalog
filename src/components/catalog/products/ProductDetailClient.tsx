"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductCatalog } from "@/types/product.types";
import Header from "@/components/catalog/header/Header";
import { ProductImageGallery } from "@/components/catalog/products/ProductImageGallery";
import { ProductInfo } from "@/components/catalog/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPublicProductBySlug } from "@/lib/actions/catalogActions";

interface ProductDetailClientProps {
  product: ProductCatalog;
  storeSlug: string;
  store: {
    name: string;
    slug: string;
    logo_url: string | null;
    whatsapp_number: string | null;
  };
}

export default function ProductDetailClient({
  product: initialProduct,
  store,
}: ProductDetailClientProps) {
  const router = useRouter();

  // TanStack Query: usa la data del servidor como initialData,
  // revalida en background sin petición extra en la primera carga
  const { data: product } = useQuery({
    queryKey: ["public-product", initialProduct.slug],
    queryFn: () => getPublicProductBySlug(initialProduct.slug),
    initialData: initialProduct,
    staleTime: 5 * 60 * 1000, // 5 min antes de revalidar
  });

  const getBadge = () => {
    if (product.is_offer_active) return "OFERTA";
    return undefined;
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="hidden md:block">
        <Header store={store} />
      </div>

      <div className="container mx-auto px-4 py-3">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <section className="container mx-auto px-2 pb-6">
        <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-7 justify-center items-center content-center">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              badge={getBadge()}
            />
          </div>
          <div>
            <ProductInfo product={product} />
          </div>
        </div>
      </section>
    </main>
  );
}
