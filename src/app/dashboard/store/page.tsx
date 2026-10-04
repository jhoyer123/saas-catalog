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

  if (!data && !isSessionPending) {
    return (
      <section className="w-full p-4">
        <div className="mx-auto w-full flex flex-col items-center justify-center min-h-100 gap-3">
          <p className="text-sm text-muted-foreground">
            Ocurrió un error inesperado.
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
      <div className="mx-auto w-full flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl font-poppins">
            Configuración de la tienda
          </h2>
          <p className="text-sm text-muted-foreground font-inter lg:text-md">
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

        {/* Mensaje cuando no existe la tienda */}
        {!data?.store && (
          <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-input p-6 text-center">
            <h2 className="text-sm font-bold tracking-tight text-muted-foreground font-poppins lg:text-xl">
              Configura tu tienda para acceder a más opciones
            </h2>

            <p className="text-sm text-muted-foreground font-inter lg:text-md">
              Crea tu tienda con los datos principales para administrar
              categorías, productos, sucursales, redes sociales y marcas.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
