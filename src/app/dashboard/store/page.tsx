"use client";

import StoreForm from "@/components/store/StoreForm";
import { BannerUploadForm } from "@/components/store/BannerUploadForm";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SketetonStoreConfig from "@/components/store/SketetonStoreConfig";

export default function StorePage() {
  const { data, isPending } = useSessionData();

  if (isPending) {
    return <SketetonStoreConfig />;
  }

  if (!isPending && (!data || !data.plan)) {
    return (
      <section className="w-full p-4">
        <div className="mx-auto max-w-6xl w-full flex flex-col items-center justify-center min-h-100 gap-3">
          <p className="text-sm text-muted-foreground">
            No se pudo cargar la información de tu tienda.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs underline text-muted-foreground hover:text-foreground"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-6xl w-full flex flex-col gap-10">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-bold font-poppins tracking-tight lg:text-2xl">
            Configuración de la tienda
          </h2>
          <p className="text-muted-foreground text-sm font-inter lg:text-md">
            Administra la información y apariencia de tu tienda.
          </p>
        </div>
        {/* ── Sección 1: Datos de la tienda ── */}
        <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6">
          <div className="flex flex-col gap-1 border-b pb-4">
            <h3 className="text-lg font-semibold font-poppins">
              Datos de la tienda
            </h3>
            <p className="text-sm text-muted-foreground font-inter">
              Gestiona y administra los datos principales de tu tienda.
              <span className="text-red-400 ml-1">Campos obligatorios</span>
            </p>
          </div>

          <StoreForm defaultValues={data?.store!} />
        </div>
        {/* ── Sección 2: Banners del catálogo ── */}
        <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6 ">
          <div className="flex flex-col gap-1 border-b border-input pb-4">
            <h3 className="text-lg font-semibold font-poppins">
              Banners del catálogo
            </h3>
            <p className="text-sm text-muted-foreground font-inter">
              Gestiona los banners que se mostrarán en tu catálogo: promociones,
              eventos especiales o información importante para tus clientes.
            </p>
          </div>

          <BannerUploadForm plan={data?.plan || undefined} />
        </div>
      </div>
    </section>
  );
}
