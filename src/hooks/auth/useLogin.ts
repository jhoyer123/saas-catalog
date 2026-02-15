import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { signInUser } from "@/lib/services/auth";
import { LoginDataInput } from "@/types/auth.types";
import { AuthResponse } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export const useLogin = (): UseMutationResult<
  AuthResponse,
  Error,
  LoginDataInput
> => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signInUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/dashboard/panel");
    },
  });
};
