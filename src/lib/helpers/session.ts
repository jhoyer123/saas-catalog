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

export const getSessionDataCached = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("stores")
      .select("*, plans(*)")
      .eq("user_id", user.id)
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
