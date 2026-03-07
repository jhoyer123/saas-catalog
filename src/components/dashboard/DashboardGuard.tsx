"use client";

import { useSessionData } from "@/hooks/auth/useSessionData";
import StoreInactive from "./StoreInactive";
import UserInactive from "./UserInactive";

/**
 * Guard client-side que mantiene las validaciones de seguridad
 * que antes hacía el layout SSR:
 * - usuario activo
 * - tienda activa
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSessionData();

  // Mientras carga la sesión, no bloquear (el middleware ya validó auth)
  if (isPending) return <>{children}</>;

  // Sin sesión → middleware ya redirige, pero por seguridad
  if (!session) return null;

  // Usuario suspendido
  if (!session.profile?.is_active) {
    return <UserInactive />;
  }

  // Tienda suspendida
  if (session.store && !session.store.is_active) {
    return <StoreInactive />;
  }

  return <>{children}</>;
}
