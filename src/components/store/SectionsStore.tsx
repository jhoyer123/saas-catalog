import { BannerContainer } from "./banners/BannerContainer";
import type { Plan } from "@/types/plan.types";
import { BranchesContainer } from "./branches/BranchesContainer";
import { SocialLinksContainer } from "./socials/SocialLinksContainer";
import { CollapsibleSection } from "../shared/CollapsibleSection";

type SectionsStoreProps = {
  plan: Plan | null;
};

export const SectionsStore = ({ plan }: SectionsStoreProps) => {
  return (
    <>
      {/* ── Section Banners from catalog ── */}
      <CollapsibleSection
        title="Banners del catálogo"
        description="Gestiona los banners que se mostrarán en tu catálogo: promociones, eventos especiales o información importante para tus clientes."
        defaultOpen={false}
      >
        <BannerContainer plan={plan!} />
      </CollapsibleSection>
      {/* ── Section branches from store ── */}
      <CollapsibleSection
        title="Sucursales"
        description={
          <>
            Agrega una o varias sucursales con su nombre, dirección y teléfono.
            <span className="text-red-400 ml-1">Campos obligatorios</span>
          </>
        }
      >
        <BranchesContainer />
      </CollapsibleSection>
      {/* ── Section Social Media ──  */}
      <CollapsibleSection
        title="Redes Sociales"
        description={
          <>
            Agrega los enlaces de tus perfiles oficiales en redes sociales para
            que se muestren en tu catálogo.
            <span className="text-red-400 ml-1">Campos obligatorios</span>
          </>
        }
      >
        <SocialLinksContainer />
      </CollapsibleSection>
    </>
  );
};
