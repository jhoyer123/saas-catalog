import { FormBranches } from "@/components/settings/FormBranches";
import { FormSocials } from "@/components/settings/FormSocials";
import SkeletonSettings from "@/components/settings/SkeletonSettings";
import { useGetBranches } from "@/hooks/settings/useGetBranches";
import { useGetSocialLinks } from "@/hooks/settings/useGetSocialLinks";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";
import { BannerUploadForm } from "./BannerUploadForm";
import type { Plan } from "@/types/plan.types";

type SectionsStoreProps = {
  plan: Plan | null;
};

export const SectionsStore = ({ plan }: SectionsStoreProps) => {
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

  if (isBranchesLoading || isSocialLinksLoading) {
    return <SkeletonSettings />;
  }

  return (
    <>
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

        <BannerUploadForm plan={plan!} />
      </div>
      {/* ── Sección 3: sucursales ── */}
      <div className="flex flex-col gap-4 border rounded-lg border-input p-2 w-full bg-card font-inter md:p-6">
        <div className="flex flex-col gap-1 border-b pb-4">
          <h3 className="text-lg font-semibold font-poppins">Sucursales</h3>
          <p className="text-sm text-muted-foreground font-inter">
            Agrega una o varias sucursales con su nombre, dirección y teléfono.
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
          <h3 className="text-lg font-semibold font-poppins">Redes Sociales</h3>
          <p className="text-sm text-muted-foreground font-inter">
            Agrega los enlaces de tus perfiles oficiales en redes sociales para
            que se muestren en tu catálogo.
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
  );
};
