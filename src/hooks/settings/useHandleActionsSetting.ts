import { useToastPromise } from "../shared/useToastPromise";
import { useSaveSocialLinks } from "./useSaveSocialLinks";
import { useSaveBranches } from "./useSaveBranches";
import { useState } from "react";

export function useHandleActionsSettings() {
  const [isPending, setIsPending] = useState(false);

  const { mutateAsync: saveSocialLinks } = useSaveSocialLinks();
  const { mutateAsync: saveBranches } = useSaveBranches();

  const { showPromise } = useToastPromise();

  const withPending = async (fn: () => Promise<void>) => {
    if (isPending) {
      throw new Error("Hay una operacion en curso. Intenta nuevamente.");
    }
    setIsPending(true);
    try {
      await fn();
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Action Save Social Links Executed with Toast Notifications
   * @param socialLinks
   * @param onSuccess
   */
  type SocialLink = {
    platform: string;
    url: string;
  };

  const saveSocialLinksAction = (socialLinks: SocialLink[]) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await saveSocialLinks({ socialLinks });
        });
      },
      messages: {
        loading: "Guardando enlaces sociales...",
        success: "Enlaces sociales guardados",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  /**
   * Action Save Branches Executed with Toast Notifications
   * @param branches
   * @param onSuccess
   */
  type Branch = {
    name: string;
    address: string;
    phone: string;
    lat?: number;
    lng?: number;
  };

  const saveBranchesAction = (branches: Branch[]) => {
    showPromise({
      promise: async () => {
        await withPending(async () => {
          await saveBranches({ branches });
        });
      },
      messages: {
        loading: "Guardando sucursales...",
        success: "Sucursales guardadas",
        error: (err) => err.message,
      },
      richColors: true,
      position: "top-right",
      duration: 3000,
    });
  };

  return {
    saveSocialLinks: saveSocialLinksAction,
    saveBranches: saveBranchesAction,
    isPending,
  };
}
