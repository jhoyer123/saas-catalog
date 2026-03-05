"use client";

import StoreForm from "@/components/store/StoreForm";
import { BannerUploadForm } from "@/components/store/BannerUploadForm";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SketetonStoreConfig from "@/components/store/SketetonStoreConfig";

export default function DashboardPage() {
  const { data, isPending } = useSessionData();

  if (isPending) {
    return <SketetonStoreConfig />;
  }

  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 items-center justify-center">
        {/* ── Sección 1: Datos de la tienda ── */}
        <div className="flex flex-col gap-1 justify-start items-start w-full">
          <h2 className="text-3xl font-bold tracking-tight font-inter">
            Configuración de la tienda
          </h2>
        </div>
        <div className="flex flex-col gap-4 border rounded-md border-input p-4 w-full">
          <p className="text-muted-foreground font-inter border-b border-input pb-4">
            Gestiona y administra los datos de tu tienda.
          </p>
          <StoreForm defaultValues={data?.store!} />
        </div>
        {/* ── Sección 2: Banners del catálogo ── */}
        {/* ── Sección 1: Datos de la tienda ── */}
        <div className="flex flex-col gap-4 border rounded-md border-input p-4 w-full">
          <p className="text-muted-foreground font-inter border-b border-input pb-4">
            Gestiona los banners que se mostrarán en tu catálogo.
          </p>
          <BannerUploadForm />
        </div>
      </div>
    </section>
  );
}
