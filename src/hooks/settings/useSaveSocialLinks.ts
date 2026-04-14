import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSocialLinks } from "@/lib/actions/settingActions";
import { useSessionData } from "../auth/useSessionData";

/**
 * Hook para guardar las redes sociales de la tienda.
 */
type SocialLink = {
  platform: string;
  url: string;
};

export const useSaveSocialLinks = () => {
  const queryClient = useQueryClient();

  //get data session
  const { data: sessionData } = useSessionData();
  const storeId = sessionData?.store?.id;
  const slugStore = sessionData?.store?.slug;

  return useMutation({
    mutationFn: async ({ socialLinks }: { socialLinks: SocialLink[] }) => {
      if (!storeId || !slugStore) {
        throw new Error("No se pudo obtener la información de la tienda");
      }
      const result = await saveSocialLinks(storeId!, socialLinks, slugStore!);
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-social-links"] });
    },
  });
};
