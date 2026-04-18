"use client";

import { FormBranches } from "@/components/settings/FormBranches";
import { FormSocials } from "@/components/settings/FormSocials";
import { useGetBranches } from "@/hooks/settings/useGetBranches";
import { useGetSocialLinks } from "@/hooks/settings/useGetSocialLinks";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";

export default function SettingsPage() {
  //get for branches and socials links
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
  const { isPending, saveBranches, saveSocialLinks } =
    useHandleActionsSettings();

  if (isBranchesLoading || isSocialLinksLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <section className="w-full p-4">
      <div className="mx-auto max-w-6xl w-full flex flex-col gap-10">
        {/* title and description */}
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-xl font-bold font-poppins tracking-tight lg:text-2xl">
            Configuración del negocio
          </h2>
          <p className="text-muted-foreground text-sm font-inter lg:text-md">
            Administra la información de tu negocio, como sucursales y redes
            sociales.
          </p>
        </div>
        {/* section for branches */}
        <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6">
          <div className="flex flex-col gap-1 border-b pb-4">
            <h3 className="text-lg font-semibold font-poppins">Sucursales</h3>
            <p className="text-sm text-muted-foreground font-inter">
              Agrega una o varias sucursales con su nombre, dirección y
              teléfono.
              <span className="text-red-400 ml-1">Campos obligatorios</span>
            </p>
          </div>

          <FormBranches
            defaultValues={{ branches: branchesData || [] }}
            onSubmit={(data) => saveBranches(data.branches)}
            isPending={isPending}
          />
        </div>
        {/* section for social links */}
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
            isPending={isPending}
          />
        </div>
      </div>
    </section>
  );
}
