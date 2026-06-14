"use client";

import StoreForm from "@/components/store/StoreForm";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SketetonStoreConfig from "@/components/store/SketetonStoreConfig";
import { SectionsStore } from "@/components/store/SectionsStore";

export default function StorePage() {
  const { data, isPending: isSessionPending } = useSessionData();

  if (isSessionPending) {
    return <SketetonStoreConfig />;
  }

  if (!isSessionPending && !data) {
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
        {/* si la tienda existe */}
        {data?.store && data?.plan && (
          /* secciones que necesitan que la tienda se cree antes */
          <SectionsStore plan={data?.plan} />
        )}

        {/* Si no existe tienda, se muestra un mensaje indicando que las demas secciones no están disponibles */}
        {!data?.store && (
          <div className="flex flex-col gap-2 w-full intems-center justify-center border rounded-lg border-input p-6 text-center">
            <h2 className="text-xl font-bold text-muted-foreground font-poppins tracking-tight lg:text-2xl text-center">
              Configura tu tienda para poder acceder a mas secciones de
              configuración de tu negocio
            </h2>
            <p className="text-muted-foreground text-sm font-inter lg:text-md text-center">
              Para administrar categorías, productos, sucursales, redes sociales
              y marcas, primero debes crear tu tienda con los datos principales.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
