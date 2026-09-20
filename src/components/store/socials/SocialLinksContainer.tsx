import { LoadingSpinner } from "../../shared/LoadingSpinner";
import { ErrorDisplay } from "../../shared/ErrorDisplay";
import { useHandleActionsSettings } from "@/hooks/settings/useHandleActionsSetting";
import { useGetSocialLinks } from "@/hooks/settings/useGetSocialLinks";
import FormSocials from "./FormSocials";

export const SocialLinksContainer = () => {
  //get banners
  const { data, isLoading, isError, refetch } = useGetSocialLinks();

  const toSocialFormValues = (links?: { platform: string; url: string }[]) => ({
    facebook: links?.find((l) => l.platform === "facebook")?.url ?? "",
    instagram: links?.find((l) => l.platform === "instagram")?.url ?? "",
    tiktok: links?.find((l) => l.platform === "tiktok")?.url ?? "",
    x: links?.find((l) => l.platform === "x")?.url ?? "",
  });

  //functions to handle form submissions for branches and social links
  const { isPending: isSettingsPending, saveSocialLinks } =
    useHandleActionsSettings();

  if (isLoading) {
    return <LoadingSpinner label="Cargando Redes Sociales..." />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        title="No se pudieron cargar las Redes Sociales"
        message="Verifica tu conexión e inténtalo nuevamente."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <FormSocials
      defaultValues={toSocialFormValues(data)}
      onSubmit={(data) => {
        const links = Object.entries(data)
          .filter(([_, url]) => url !== "")
          .map(([platform, url]) => ({ platform, url }));
        saveSocialLinks(links);
      }}
      isPending={isSettingsPending}
    />
  );
};
