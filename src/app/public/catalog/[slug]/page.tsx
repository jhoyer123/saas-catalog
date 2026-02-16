"use client";

import { useParams, useRouter } from "next/navigation";
import { mockProducts } from "@/constants/products.mock";
import Header from "@/components/catalog/header/Header";
import { ProductImageGallery } from "@/components/catalog/products/ProductImageGallery";
import { ProductInfo } from "@/components/catalog/products/ProductInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Buscar el producto por slug
  const product = mockProducts.find((p) => p.slug === slug);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Si no se encuentra el producto
  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Producto no encontrado
            </h1>
            <p className="mt-4 text-gray-600">
              El producto que buscas no existe o ha sido removido.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/public/catalog")}
            >
              Volver al catálogo
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Determinar el badge para la galería
  const getBadge = () => {
    if (product.is_offer && product.offer_price) {
      return "OFERTA";
    }
    // Puedes agregar más lógica aquí, por ejemplo:
    // if (product.display_order === 1) return "Best Seller";
    return undefined;
  };

  // Manejadores de botones
  const handleAddToCart = () => {
    setIsAddingToCart(true);
    // Aquí irá la lógica de agregar al carrito
    // Simulación de acción
  };

  const handleRequestProduct = () => {
    setIsRequesting(true);
    // Aquí irá la lógica de solicitar producto
    console.log("Solicitando producto:", product.name);

    // Simulación de acción
    setTimeout(() => {
      setIsRequesting(false);
      alert(`Solicitud enviada para: ${product.name}`);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Botón de volver */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Contenido del producto */}
      <section className="container mx-auto px-2 pb-6">
        <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              badge={getBadge()}
            />
          </div>

          {/* Información del producto */}
          <div>
            <ProductInfo
              product={product}
              onAddToCart={handleAddToCart}
              onRequestProduct={handleRequestProduct}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
