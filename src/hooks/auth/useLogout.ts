import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOutUser } from "@/lib/services/auth";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/auth/login");
    },
  });
};
