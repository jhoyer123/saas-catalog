// src/hooks/useSessionData.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessionData } from "@/lib/actions/authActions";
import { User } from "@/types/auth.types";
import { Store } from "@/types/store.types";
import { Plan } from "@/types/plan.types";

type SessionData = {
  profile: User | null;
  store: Store | null;
  plan: Plan | null;
  hasStore: boolean;
};

export const useSessionData = () => {
  return useQuery<SessionData | null>({
    queryKey: ["session-data"],
    queryFn: getSessionData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
