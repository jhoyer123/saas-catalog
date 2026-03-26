import { useQuery } from "@tanstack/react-query";
import { fetchPlans } from "@/lib/services/dashboard";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 3000 * 60 * 60,
  });
};
