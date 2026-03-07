/**
 * Versión con cache() de React de getSessionData.
 *
 * React.cache() deduplica llamadas dentro del MISMO ciclo de render en servidor:
 * si tanto el layout como el page llaman a esta función, Supabase solo se consulta UNA vez.
 *
 * USO: Solo en Server Components / layouts.
 * Para el cliente, seguir usando el hook useSessionData (TanStack Query).
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/supabaseServer";
import type { User } from "@/types/auth.types";
import type { Store } from "@/types/store.types";
import type { Plan } from "@/types/plan.types";

type SessionData = {
  profile: User | null;
  store: Store | null;
  plan: Plan | null;
  hasStore: boolean;
};

export const getSessionDataCached = cache(async (): Promise<SessionData | null> => {
  const supabase = await createClient();

  // getSession() decodifica el JWT localmente (~0ms) en vez de
  // hacer un round-trip a Supabase Auth (~200-500ms) con getUser().
  // Es seguro porque el middleware ya validó el JWT con getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const userId = session.user.id;

  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("stores")
      .select("*, plans(*)")
      .eq("user_id", userId)
      .single(),
  ]);

  if (!profile) return null;

  return {
    profile,
    store,
    plan: store?.plans ?? null,
    hasStore: !!store,
  };
});
