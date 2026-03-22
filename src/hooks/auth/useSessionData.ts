// src/hooks/useSessionData.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSessionData } from "@/lib/services/dashboard";
import type { SessionData } from "@/lib/services/dashboard";

export type { SessionData };

export const useSessionData = () => {
  return useQuery<SessionData | null>({
    queryKey: ["session-data"],
    queryFn: fetchSessionData,
    staleTime: 1000 * 60 * 5, // Los datos se consideran frescos por 5 minutos
    gcTime: 1000 * 60 * 30, // Mantener en caché por 30 minutos aunque no se usen
  });
};
