"use client";

import { useSessionData } from "@/hooks/auth/useSessionData";
import StoreInactive from "./StoreInactive";
import UserInactive from "./UserInactive";
import { checkIsPlanActive } from "@/lib/helpers/validations";

/**
 * Guard client-side que mantiene las validaciones de seguridad
 * que antes hacía el layout SSR:
 * - usuario activo
 * - tienda activa
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSessionData();

  // Mientras carga la sesión no mostrar contenido del dashboard.
  // Esto evita que al cerrar sesión y pulsar "atrás" se vean datos viejos.
  if (isPending) return null;

  // Sin sesión → middleware ya redirige, pero por seguridad
  if (!session) return null;

  // Usuario suspendido
  if (!session.profile?.is_active) {
    return <UserInactive />;
  }

  // Usuario suspendido por falta de pago
  if (
    session.store &&
    !checkIsPlanActive({
      is_active: session.store.is_active,
      plan_expires_at: session.store.plan_expires_at,
    })
  ) {
    return <StoreInactive />;
  }

  return <>{children}</>;
}
