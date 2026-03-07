"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabaseClient";

export default function BfcacheGuard() {
  const router = useRouter();

  useEffect(() => {
    const handlePageShow = async (event: PageTransitionEvent) => {
      if (event.persisted) {
        const supabase = createClient();

        // 👇 getUser() valida contra el servidor, no usa caché local
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/login");
        } else {
          router.refresh();
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  return null;
}
