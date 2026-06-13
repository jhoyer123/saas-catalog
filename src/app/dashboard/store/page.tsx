"use client";

import StoreForm from "@/components/store/StoreForm";
import { BannerUploadForm } from "@/components/store/BannerUploadForm";
import { useSessionData } from "@/hooks/auth/useSessionData";
import SketetonStoreConfig from "@/components/store/SketetonStoreConfig";

import { FormBranches } from "@/components/settings/FormBranches";
import { FormSocials } from "@/components/settings/FormSocials";
import SkeletonSettings from "@/components/settings/SkeletonSettings";
import { useGetBranches } from "@/hooks/settings/useGetBranches";
import { useGetSocialLinks } from "@/hooks/settings/useGetSocialLinks";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";

export default function StorePage() {
  const { data, isPending: isSessionPending } = useSessionData();

  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranches();
  const { data: socialLinksData, isLoading: isSocialLinksLoading } =
    useGetSocialLinks();

  const toSocialFormValues = (links?: { platform: string; url: string }[]) => ({
    facebook: links?.find((l) => l.platform === "facebook")?.url ?? "",
    instagram: links?.find((l) => l.platform === "instagram")?.url ?? "",
    tiktok: links?.find((l) => l.platform === "tiktok")?.url ?? "",
    x: links?.find((l) => l.platform === "x")?.url ?? "",
  });

  //functions to handle form submissions for branches and social links
  const {
    isPending: isSettingsPending,
    saveBranches,
    saveSocialLinks,
  } = useHandleActionsSettings();

  if (isSessionPending || isBranchesLoading || isSocialLinksLoading) {
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
        {data?.store && (
          <>
            {/* ── Sección 2: Banners del catálogo ── */}
            <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6 ">
              <div className="flex flex-col gap-1 border-b border-input pb-4">
                <h3 className="text-lg font-semibold font-poppins">
                  Banners del catálogo
                </h3>
                <p className="text-sm text-muted-foreground font-inter">
                  Gestiona los banners que se mostrarán en tu catálogo:
                  promociones, eventos especiales o información importante para
                  tus clientes.
                </p>
              </div>

              <BannerUploadForm plan={data?.plan || undefined} />
            </div>
            {/* ── Sección 3: sucursales ── */}
            <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6">
              <div className="flex flex-col gap-1 border-b pb-4">
                <h3 className="text-lg font-semibold font-poppins">
                  Sucursales
                </h3>
                <p className="text-sm text-muted-foreground font-inter">
                  Agrega una o varias sucursales con su nombre, dirección y
                  teléfono.
                  <span className="text-red-400 ml-1">Campos obligatorios</span>
                </p>
              </div>

              <FormBranches
                defaultValues={{ branches: branchesData || [] }}
                onSubmit={(data) => saveBranches(data.branches)}
                isPending={isSettingsPending}
              />
            </div>
            {/* ── Sección 3: Redes Sociales ──  */}
            <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6">
              <div className="flex flex-col gap-1 border-b pb-4">
                <h3 className="text-lg font-semibold font-poppins">
                  Redes Sociales
                </h3>
                <p className="text-sm text-muted-foreground font-inter">
                  Agrega los enlaces de tus perfiles oficiales en redes sociales
                  para que se muestren en tu catálogo.
                  <span className="text-red-400 ml-1">Campos obligatorios</span>
                </p>
              </div>

              <FormSocials
                defaultValues={toSocialFormValues(socialLinksData)}
                onSubmit={(data) => {
                  const links = Object.entries(data)
                    .filter(([_, url]) => url !== "")
                    .map(([platform, url]) => ({ platform, url }));
                  saveSocialLinks(links);
                }}
                isPending={isSettingsPending}
              />
            </div>
          </>
        )}

        {/* Si no existe tienda, se muestra un mensaje indicando que las demas secciones no están disponibles */}
        {!data?.store && (
          <div className="flex flex-col gap-2 w-full">
            <h2 className="text-xl font-bold font-poppins tracking-tight lg:text-2xl">
              Configura tu tienda para poder acceder a las secciones de
              configuración del negocio de abajo
            </h2>
            <p className="text-muted-foreground text-sm font-inter lg:text-md">
              Para administrar categorías, productos, sucursales, redes sociales
              y marcas, primero debes crear tu tienda con los datos principales.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
