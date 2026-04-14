import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutUser } from "@/lib/services/auth";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      queryClient.clear();
      // replace evita que el botón "atrás" vuelva al dashboard
      window.location.replace("/auth/login");
      localStorage.removeItem("plan_expiring_dialog_seen");
    },
    onError: () => {
      // Si falla el signOut en el servidor, igual limpias localmente
      queryClient.clear();
      window.location.replace("/auth/login");
      localStorage.removeItem("plan_expiring_dialog_seen");
    },
  });
};
