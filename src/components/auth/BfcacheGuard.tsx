"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/supabaseClient";

/**
 * Detecta cuando el navegador restaura la página desde bfcache o
 * cuando el usuario vuelve a la pestaña. Si no hay sesión activa,
 * redirige de inmediato al login sin parpadeo del dashboard.
 */
export default function BfcacheGuard() {
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // replace para que no quede en el historial
        window.location.replace("/auth/login");
      }
    };

    // bfcache: el navegador restauró la página completa desde memoria
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        checkSession();
      }
    };

    // Cuando el usuario vuelve a la pestaña (alt-tab, cambio de pestaña, etc.)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
