"use client";

import SkeletonSettings from "@/components/settings/SkeletonSettings";
import { useGetBranches } from "@/hooks/settings/useGetBranches";
import { useGetSocialLinks } from "@/hooks/settings/useGetSocialLinks";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";

export default function SettingsPage() {
  //get for branches and socials links
  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranches();
  const { data: socialLinksData, isLoading: isSocialLinksLoading } =
    useGetSocialLinks();

  if (isBranchesLoading || isSocialLinksLoading) return <SkeletonSettings />;

  return (
    <section className="w-full p-4">
      {/* anuncio */}
      <span className="text-muted-foreground text-md lg:text-lg">
        pagina no disponible
      </span>
    </section>
  );
}
