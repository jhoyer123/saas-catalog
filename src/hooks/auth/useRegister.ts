import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { signUpNewUser } from "@/lib/services/auth";
import { RegisterDataInput } from "@/types/auth.types";
import { AuthResponse } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export const useRegister = (): UseMutationResult<
  AuthResponse,
  Error,
  RegisterDataInput
> => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signUpNewUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/auth/login");
    },
  });
};
