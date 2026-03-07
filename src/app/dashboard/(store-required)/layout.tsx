"use client";
/**
 * Layout guard for routes that REQUIRE an existing store.
 * * Protected routes:
 * • /dashboard/products   (and sub-routes)
 * • /dashboard/categories (and sub-routes)
 * * If the user DOES NOT have a store, a friendly message is displayed
 * with a link to create one.
 */

import { useSessionData } from "@/hooks/auth/useSessionData";
import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StoreRequiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: sessionData, isPending } = useSessionData();

  // Mientras carga, renderizamos children (el middleware ya protege auth)
  if (isPending) return <>{children}</>;

  // whitout session, middleware already redirects to login, but just in case
  if (!sessionData) return null;

  //validator main condition: has store?
  if (!sessionData.hasStore) {
    return (
      <div className="flex flex-1 items-center justify-center w-full h-full px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Ícono */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Store className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Primero configura tu tienda
            </h2>
            <p className="text-sm text-gray-500">
              Para gestionar productos y categorías necesitas crear tu tienda
              primero. Solo toma unos minutos.
            </p>
          </div>

          {/* CTA */}
          <Button asChild>
            <Link href="/dashboard/store">Crear mi tienda</Link>
          </Button>
        </div>
      </div>
    );
  }

  //if has store, render children (las páginas protegidas)
  return <>{children}</>;
}
