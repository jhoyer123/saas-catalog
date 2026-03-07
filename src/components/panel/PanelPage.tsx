"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ExternalLink,
  Store,
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { Store as StoreType } from "@/types/store.types";

interface DashboardPageProps {
  hasProducts?: boolean;
  store?: StoreType | null;
}

export default function PanelPage({
  hasProducts = false,
  store = null,
}: DashboardPageProps) {
  const storeIsComplete = !!(
    store?.name &&
    store?.whatsapp_number &&
    store?.logo_url &&
    store?.is_active
  );
  const canShowCatalog = storeIsComplete && hasProducts;

  // Steps para onboarding
  const steps = [
    {
      done: storeIsComplete,
      label: "Configura tu tienda",
      description: "Nombre, logo y WhatsApp",
      href: "/dashboard/store",
    },
    {
      done: hasProducts,
      label: "Agrega un producto",
      description: "Al menos uno para publicar",
      href: "/dashboard/products",
    },
  ];

  const allDone = steps.every((s) => s.done);

  return (
    <section className="mx-auto max-w-4xl w-full space-y-8 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de control</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Administra tu tienda y productos desde aquí, para compartir tu
          catálogo con tus clientes completa las configuraciones necesarias.
        </p>
      </div>

      {/* Checklist de configuración — solo si no está todo listo */}
      {!allDone && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-5 space-y-3">
          <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Completa estos pasos para publicar tu catálogo
          </p>
          <div className="space-y-2">
            {steps.map((step) => (
              <Link
                key={step.href}
                href={step.done ? "#" : step.href}
                className={`flex items-center justify-between rounded-md px-4 py-3 text-sm transition
                  ${
                    step.done
                      ? "bg-white text-gray-400 cursor-default"
                      : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-400 shrink-0" />
                  )}
                  <div>
                    <p className={step.done ? "line-through" : "font-medium"}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
                {!step.done && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cards principales */}
      {store ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Catálogo */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Store className="w-5 h-5" />
              <h3 className="font-semibold">Tu catálogo público</h3>
            </div>
            <p className="text-sm text-gray-500">
              Comparte este enlace con tus clientes.
            </p>
            <div className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-500 truncate font-mono">
              /public/{store.slug}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={!canShowCatalog}
              onClick={() =>
                canShowCatalog && window.open(`/public/${store.slug}`, "_blank")
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver catálogo
            </Button>
          </div>

          {/* Productos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Package className="w-5 h-5" />
              <h3 className="font-semibold">Productos</h3>
            </div>
            <p className="text-sm text-gray-500">
              Administra el inventario de tu tienda.
            </p>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/dashboard/products">Ir a productos</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 flex flex-col gap-4 items-center justify-center text-center">
          <Store className="w-10 h-10 text-gray-300" />
          <div>
            <p className="font-medium text-gray-700">
              Crea tu tienda para comenzar
            </p>
            <p className="text-sm text-gray-400 mt-1">Solo toma unos minutos</p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/store">Crear tienda</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
